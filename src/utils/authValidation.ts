const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginForm = {
  email: string;
  password: string;
};

export type RegisterForm = LoginForm & {
  confirmPassword: string;
};

export type AuthFormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function validateLoginForm(values: LoginForm): AuthFormErrors {
  const errors: AuthFormErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = 'Informe seu e-mail.';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Digite um e-mail valido.';
  }

  if (!values.password) {
    errors.password = 'Informe sua senha.';
  }

  return errors;
}

export function validateRegisterForm(values: RegisterForm): AuthFormErrors {
  const errors = validateLoginForm(values);

  if (!values.password) {
    errors.password = 'Informe uma senha.';
  } else if (values.password.length < 6) {
    errors.password = 'A senha deve ter no minimo 6 caracteres.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirme sua senha.';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'As senhas nao coincidem.';
  }

  return errors;
}

export function hasValidationErrors(errors: AuthFormErrors) {
  return Boolean(errors.email || errors.password || errors.confirmPassword);
}
