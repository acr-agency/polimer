"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import s from "./PriceForm.module.css";

type Props = {
  onClose: () => void;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  agreement: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initial: FormState = {
  name: "",
  phone: "",
  email: "",
  agreement: false,
};

function digitsOnly(v: string) {
  return v.replace(/\D/g, "");
}

function formatPhoneRU(input: string): string {
  let d = digitsOnly(input);

  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;

  d = d.slice(0, 11);

  const p = d.slice(1);
  const a = p.slice(0, 3);
  const b = p.slice(3, 6);
  const c = p.slice(6, 8);
  const e = p.slice(8, 10);

  let out = "+7";
  if (a) out += ` (${a}`;
  if (a.length === 3) out += `)`;
  if (b) out += ` ${b}`;
  if (c) out += `-${c}`;
  if (e) out += `-${e}`;

  return out;
}

function isPhoneComplete(masked: string): boolean {
  return digitsOnly(masked).length === 11;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateFields(values: FormState): FormErrors {
  const errors: FormErrors = {};

  const name = values.name.trim();
  if (name.length < 2) {
    errors.name = "Введите имя (минимум 2 символа).";
  } else if (name.length > 50) {
    errors.name = "Имя не должно превышать 50 символов.";
  }

  if (!isPhoneComplete(values.phone)) {
    errors.phone = "Введите корректный номер телефона.";
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = "Введите email адрес.";
  } else if (!isValidEmail(email)) {
    errors.email = "Введите корректный email адрес.";
  }

  return errors;
}

function validateForSubmit(values: FormState): FormErrors {
  const errors = validateFields(values);

  if (!values.agreement) {
    errors.agreement = "Необходимо согласие на обработку данных.";
  }

  return errors;
}

export default function PriceForm({ onClose }: Props) {
  const [values, setValues] = useState<FormState>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAll();
      }
    };

    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let next: string | boolean = e.target.value;

      if (key === "phone") {
        next = formatPhoneRU(e.target.value);
      }

      setValues((prev) => ({ ...prev, [key]: next }));
      setSubmitError("");

      setErrors((prev) => {
        if (!prev[key]) return prev;
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    };

  const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, agreement: e.target.checked }));
    setSubmitError("");

    setErrors((prev) => {
      if (!prev.agreement) return prev;
      const copy = { ...prev };
      delete copy.agreement;
      return copy;
    });
  };

  const closeAll = () => {
    setIsSuccess(false);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    onClose();
  };

  // const triggerDownload = () => {
  //   const link = document.createElement("a");
  //   link.href = "/docs/Ценовое предложение.pdf"; 
  //   link.download = "Ценовое предложение.pdf";
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validateForSubmit(values);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        topic: "Запрос прайс-листа",
      };

      const response = await fetch("/api/send-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result?.fields && typeof result.fields === "object") {
          setErrors(result.fields);
        } else {
          setSubmitError(
            result?.error || "Не удалось отправить. Попробуйте ещё раз."
          );
        }
        return;
      }

      // Отправка успешна — скачиваем PDF
      // triggerDownload();

      setIsSuccess(true);
      setValues(initial);
      setErrors({});
      setSubmitError("");

      timerRef.current = window.setTimeout(() => {
        closeAll();
      }, 4000);
    } catch {
      setSubmitError(
        "Не удалось отправить. Проверьте соединение и попробуйте ещё раз."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contentVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className={s.popOverley}
      onMouseDown={closeAll}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className={s.popBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <motion.div
            className={s.popBox}
            onMouseDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, scale: 0.98, filter: "blur(4px)" }}
            transition={{
              duration: 0.42,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <button
              type="button"
              className={s.close}
              onClick={closeAll}
              aria-label="Закрыть"
            />

            {!isSuccess ? (
              <>
                <div className={s.header}>
                  <div className={s.iconWrapper}>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className={s.popTitle}>Получить прайс-лист</h3>
                </div>

                <p className={s.popText}>
                  Мы ценим наших новых и постоянных клиентов. <br /><br /> Пожалуйста,
                  заполните форму и мы отправим вам прайс-лист. <br /> Мы всегда рады взаимовыгодному сотрудничеству.
                </p>

                <form className={s.popForm} onSubmit={onSubmit} noValidate>
                  <motion.div
                    className={s.field}
                    variants={itemVariants}
                  >
                    <input
                      className={`${s.popFormInput} ${errors.name ? s.inputError : ""}`}
                      value={values.name}
                      onChange={onChange("name")}
                      type="text"
                      placeholder="Ваше имя"
                      autoComplete="name"
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <div className={s.errorText}>{errors.name}</div>
                    )}
                  </motion.div>

                  <motion.div
                    className={s.field}
                    variants={itemVariants}
                  >
                    <input
                      className={`${s.popFormInput} ${errors.phone ? s.inputError : ""}`}
                      value={values.phone}
                      onChange={onChange("phone")}
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      inputMode="tel"
                      autoComplete="tel"
                      disabled={isSubmitting}
                    />
                    {errors.phone && (
                      <div className={s.errorText}>{errors.phone}</div>
                    )}
                  </motion.div>

                  <motion.div
                    className={s.field}
                    variants={itemVariants}
                  >
                    <input
                      className={`${s.popFormInput} ${errors.email ? s.inputError : ""}`}
                      value={values.email}
                      onChange={onChange("email")}
                      type="email"
                      placeholder="Ваш email"
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <div className={s.errorText}>{errors.email}</div>
                    )}
                  </motion.div>

                  <motion.div
                    className={s.field}
                    variants={itemVariants}
                  >
                    <label className={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        className={s.checkboxInput}
                        checked={values.agreement}
                        onChange={onCheckboxChange}
                        disabled={isSubmitting}
                      />
                      <span className={s.checkboxCustom}></span>
                      <span className={s.checkboxText}>
                        Я ознакомился с{" "}
                        <a
                          className={s.popFormTextLink}
                          href="/politiko"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Правилами обработки персональных данных
                        </a>
                      </span>
                    </label>
                    {errors.agreement && (
                      <div className={s.errorText}>{errors.agreement}</div>
                    )}
                  </motion.div>

                  {submitError && (
                    <motion.div
                      className={s.submitError}
                      variants={itemVariants}
                    >
                      {submitError}
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants}>
                    <button
                      className={`butt `}
                      style={{width:"100%"}}
                      type="submit"
                      disabled={isSubmitting}
                    >
                      <span className={s.submitContent}>
                        {isSubmitting ? (
                          <>
                            <span className={s.spinner} />
                            Отправляем...
                          </>
                        ) : (
                          <>
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Отправить запрос и получить <br className={s.mob} /> прайс-лист
                          </>
                        )}
                      </span>
                    </button>
                  </motion.div>
                </form>
              </>
            ) : (
              <motion.div
                className={s.success}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={s.successIcon}>
                  <svg
                    width="54"
                    height="54"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h3 className={s.successTitle}>Запрос отправлен!</h3>
                <p className={s.successText}>
                  Спасибо за интерес к нашему предложению. Мы свяжемся с вами в ближайшее время.
                </p>

                <button className={`butt ${s.successBtn}`} onClick={closeAll}>
                  Хорошо
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}