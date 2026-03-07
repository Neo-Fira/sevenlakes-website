(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const body = document.body;
  const locale = body.dataset.locale || "ru";
  const phone = (body.dataset.whatsapp || "992552225544").replace(/\D+/g, "");
  const telegramUsername = (body.dataset.telegram || "sevenlakes7").replace(/^@/, "");
  const analytics = {
    ga4: body.dataset.ga4 || "",
    ym: body.dataset.ym || ""
  };

  const text = {
    ru: {
      leadDefault: "Заявка на тур",
      fieldFallback: "Поле",
      unknown: "—",
      page: "Страница",
      telegramCopied: "Текст заявки скопирован. Вставьте его в Telegram.",
      telegramCopyFail: "Скопировать автоматически не удалось. Отправьте короткое сообщение вручную.",
      whatsapp: "whatsapp",
      telegram: "telegram"
    },
    en: {
      leadDefault: "Tour request",
      fieldFallback: "Field",
      unknown: "—",
      page: "Page",
      telegramCopied: "Request text copied. Paste it into Telegram.",
      telegramCopyFail: "Auto-copy failed. Please send a short message manually.",
      whatsapp: "whatsapp",
      telegram: "telegram"
    }
  };

  const i18n = text[locale] || text.ru;

  const showToast = (message) => {
    let toast = $("[data-toast]");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("data-toast", "");
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  };

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      if ($(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

  const trackLead = (method) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "generate_lead", {
        method,
        page_location: location.href,
        language: locale
      });
    }
    if (typeof window.ym === "function" && analytics.ym) {
      window.ym(Number(analytics.ym), "reachGoal", `lead_${method}`);
    }
  };

  const trackClick = (name) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "select_content", {
        content_type: "cta",
        item_id: name,
        page_location: location.href
      });
    }
    if (typeof window.ym === "function" && analytics.ym) {
      window.ym(Number(analytics.ym), "reachGoal", `cta_${name}`);
    }
  };

  const initAnalytics = () => {
    if (analytics.ga4) {
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${analytics.ga4}`)
        .then(() => {
          window.dataLayer = window.dataLayer || [];
          window.gtag =
            window.gtag ||
            function () {
              window.dataLayer.push(arguments);
            };
          window.gtag("js", new Date());
          window.gtag("config", analytics.ga4, {
            anonymize_ip: true,
            allow_google_signals: true,
            transport_type: "beacon"
          });
        })
        .catch(() => {});
    }

    if (analytics.ym) {
      loadScript("https://mc.yandex.ru/metrika/tag.js")
        .then(() => {
          if (typeof window.ym !== "function") return;
          window.ym(Number(analytics.ym), "init", {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true
          });
        })
        .catch(() => {});
    }
  };

  const menuButton = $("[data-menu-toggle]");
  const menuPanel = $("[data-menu]");

  if (menuButton && menuPanel) {
    const setMenuState = (open) => {
      menuButton.setAttribute("aria-expanded", String(open));
      menuPanel.hidden = !open;
      body.classList.toggle("menu-open", open);
    };

    setMenuState(false);

    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      setMenuState(!isOpen);
    });

    menuPanel.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;
      setMenuState(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuState(false);
    });
  }

  const yearNode = $("[data-year]");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  const normalizeValue = (value) => {
    const trimmed = String(value || "").trim();
    return trimmed || i18n.unknown;
  };

  const getFieldLabel = (el) => {
    if (el.dataset.msgLabel) return el.dataset.msgLabel;
    const field = el.closest(".field");
    const label = field ? $(".field__label", field) : null;
    if (label) return label.textContent.trim();
    return i18n.fieldFallback;
  };

  const buildMessage = (form) => {
    const title = form.dataset.messageTitle || i18n.leadDefault;
    const lines = [title];

    $$("input[name], textarea[name], select[name]", form).forEach((el) => {
      const value = normalizeValue(el.value);
      const label = getFieldLabel(el);
      lines.push(`${label}: ${value}`);
    });

    lines.push(`${i18n.page}: ${location.href}`);
    return lines.join("\n");
  };

  const openWhatsapp = (message) => {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    trackLead(i18n.whatsapp);
  };

  const openTelegram = async (message) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
        showToast(i18n.telegramCopied);
      } else {
        showToast(i18n.telegramCopyFail);
      }
    } catch (error) {
      showToast(i18n.telegramCopyFail);
    }
    window.open(`https://t.me/${telegramUsername}`, "_blank", "noopener,noreferrer");
    trackLead(i18n.telegram);
  };

  document.addEventListener("click", async (event) => {
    const control = event.target.closest("[data-send]");
    if (!control) return;

    const form = control.closest("form[data-booking]") || $("form[data-booking]");
    if (!form) return;

    if (!form.reportValidity()) return;

    const message = buildMessage(form);
    const sendType = control.dataset.send;

    if (sendType === "whatsapp") {
      openWhatsapp(message);
    }

    if (sendType === "telegram") {
      await openTelegram(message);
    }
  });

  document.addEventListener("click", (event) => {
    const cta = event.target.closest("[data-track]");
    if (!cta) return;
    trackClick(cta.dataset.track);
  });

  window.addEventListener("load", () => {
    const run = () => initAnalytics();
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(run, { timeout: 3200 });
    } else {
      window.setTimeout(run, 1400);
    }
  });
})();
