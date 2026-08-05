import { body, param } from "express-validator";

export const createTodoValidator = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 100 }).withMessage('Title must be at most 100 characters'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters')
]

export const updateTodoValidator = [
    param('id')
        .isMongoId().withMessage('Invalid todo id'),

    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 100 }).withMessage('Title must be at most 100 characters'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters')
]

export const todoIdValidator = [
    param('id')
        .isMongoId().withMessage('Invalid todo id'),
]

export const getTodosValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer')
        .toInt(),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100 ')
        .toInt(),

    query('term')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Term must be at most 100 characters')

]