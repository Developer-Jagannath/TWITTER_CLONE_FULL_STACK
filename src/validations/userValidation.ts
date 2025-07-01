import Joi from 'joi';

// Validation for follow/unfollow user
export const followUserSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required'
    })
  })
});

// Validation for get followers/following
export const getFollowersSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required'
    })
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
  })
});

// Validation for get user profile
export const getUserProfileSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required'
    })
  })
}); 