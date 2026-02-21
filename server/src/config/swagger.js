/**
 * Swagger/OpenAPI Configuration
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SocialMRT API',
            version: '1.0.0',
            description: `
# SocialMRT - Social Media Management Platform API

A comprehensive API for managing social media accounts, posts, campaigns, and analytics.

## Authentication
All protected endpoints require a JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your_token>
\`\`\`

## Rate Limiting
- 100 requests per 15 minutes for authenticated users
- 20 requests per 15 minutes for unauthenticated endpoints
      `,
            contact: {
                name: 'SocialMRT Support',
                email: 'support@socialmrt.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1',
                description: 'Development Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        email: { type: 'string', format: 'email', example: 'user@example.com' },
                        fullName: { type: 'string', example: 'John Doe' },
                        avatar: { type: 'string', nullable: true },
                        isVerified: { type: 'boolean', example: false },
                        role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                user: { $ref: '#/components/schemas/User' },
                                accessToken: { type: 'string' },
                                refreshToken: { type: 'string' }
                            }
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        errors: { type: 'array', items: { type: 'object' } }
                    }
                },
                SocialAccount: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        platform: { type: 'string', enum: ['bluesky', 'mastodon', 'telegram', 'discord', 'reddit'] },
                        accountName: { type: 'string' },
                        accountId: { type: 'string' },
                        isActive: { type: 'boolean' },
                        connectedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Post: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        content: { type: 'string' },
                        mediaUrls: { type: 'array', items: { type: 'string' } },
                        platforms: { type: 'array', items: { type: 'string' } },
                        status: { type: 'string', enum: ['draft', 'scheduled', 'published', 'failed'] },
                        scheduledAt: { type: 'string', format: 'date-time', nullable: true },
                        publishedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                }
            }
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Users', description: 'User management' },
            { name: 'Social Accounts', description: 'Social media account connections' },
            { name: 'Posts', description: 'Post creation and management' },
            { name: 'Campaigns', description: 'Campaign management' },
            { name: 'Analytics', description: 'Analytics and insights' }
        ]
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
