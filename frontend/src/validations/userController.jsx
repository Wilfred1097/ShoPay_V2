import * as yup from 'yup';

export const registrationSchema = yup.object().shape({
  name: yup.string().required('\nName is required'),
  username: yup.string().required('\nUsername is required'),
  birthdate: yup.string().required('\nBirthdate is required'),
  address: yup.string().required('\nAddress is required'),
  email: yup.string().email('\nInvalid email').required('\nEmail is required'),
  profile: yup.string().url('\nInvalid url').required('\nProfile Photo is required'),
  role: yup.string().required('\nRole is required').oneOf(['user', 'admin'], '\nInvalid role'),
  password: yup.string().min(8, '\nPassword must be at least 8 characters'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], '\nPasswords must match').required('\nConfirm password is required'),
});

export const loginSchema = yup.object().shape({
  email: yup.string().email('\nInvalid email').required('\nEmail is required'),
  password: yup.string().required('\nPassword is required'),
});

export const productSchema = yup.object().shape({
  product_name: yup.string().required('Product name is required'),
  product_description: yup.string().required('Product description is required'),
  product_photo: yup.string().url('Invalid URL format').required('Product photo URL is required'),
  product_price: yup.number().integer('Price must be an integer').positive('Price must be positive').required('Price is required'),
  product_qty: yup.number().integer('Quantity must be an integer').positive('Quantity must be positive').required('Quantity is required'),
});