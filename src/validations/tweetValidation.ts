import Joi from 'joi';

// Validation for create tweet
export const createTweetSchema = Joi.object({
  body: Joi.object({
    content: Joi.string().required().min(1).max(280).messages({
      'string.empty': 'Tweet content is required',
      'string.min': 'Tweet content must be at least 1 character',
      'string.max': 'Tweet content cannot exceed 280 characters',
      'any.required': 'Tweet content is required'
    }),
    isPublic: Joi.boolean().default(true).messages({
      'boolean.base': 'isPublic must be a boolean'
    })
  })
});

// Validation for update tweet
export const updateTweetSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'Tweet ID is required',
      'any.required': 'Tweet ID is required'
    })
  }),
  body: Joi.object({
    content: Joi.string().required().min(1).max(280).messages({
      'string.empty': 'Tweet content is required',
      'string.min': 'Tweet content must be at least 1 character',
      'string.max': 'Tweet content cannot exceed 280 characters',
      'any.required': 'Tweet content is required'
    }),
    isPublic: Joi.boolean().messages({
      'boolean.base': 'isPublic must be a boolean'
    })
  })
});

// Validation for delete tweet
export const deleteTweetSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'Tweet ID is required',
      'any.required': 'Tweet ID is required'
    })
  })
});

// Validation for get tweet
export const getTweetSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'Tweet ID is required',
      'any.required': 'Tweet ID is required'
    })
  })
});

// Validation for get tweets (public, following, user)
export const getTweetsSchema = Joi.object({
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

// Validation for get user tweets
export const getUserTweetsSchema = Joi.object({
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