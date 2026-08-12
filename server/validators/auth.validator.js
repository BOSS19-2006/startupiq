const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().trim().email('Enter a valid email address.').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').toLowerCase(),
  password: z.string().min(1, 'Password is required.'),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  profile: z.object({
    bio: z.string().max(500).optional(),
    organization: z.string().max(150).optional(),
    title: z.string().max(150).optional(),
  }).optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

module.exports = { registerSchema, loginSchema, updateProfileSchema, updatePasswordSchema };
