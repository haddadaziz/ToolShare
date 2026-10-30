<<<<<<< HEAD
const swaggerDefinition = {
    openapi: '3.0.3',
    info: {
        title: 'ToolShare API',
        version: '1.0.0',
        description: 'REST API for managing ToolShare users, stores, tools, and reservations.'
=======
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'ToolShare API',
        version: '1.0.0',
        description: 'Documentation interactive de l\'API ToolShare - Plateforme de pret et gestion d\'outillage multi magasins avec detection d\'anti chevauchement temporel'
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 5000}`,
<<<<<<< HEAD
            description: 'Local development server'
        }
    ],
    tags: [
        { name: 'Health' },
        { name: 'Installation' },
        { name: 'Authentication' },
        { name: 'Users' },
        { name: 'Stores' },
        { name: 'Tools' },
        { name: 'Reservations' }
    ],
    security: [{ bearerAuth: [] }],
    paths: {
        '/api/v1/health': {
            get: {
                tags: ['Health'],
                summary: 'Check API health',
                security: [],
                responses: {
                    200: {
                        description: 'API is running.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', example: 'ok' },
                                        env: { type: 'string', example: 'development' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/installation/status': {
            get: {
                tags: ['Installation'],
                summary: 'Get installation status',
                security: [],
                responses: {
                    200: {
                        description: 'Installation status.',
=======
            description: 'Serveur de Developpement Local'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Inserez votre token JWT sous la forme: Bearer <token>'
            }
        },
        schemas: {
            ErrorResponse: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Message explicite de l\'erreur'
                    }
                }
            },
            Store: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '6ade322b464dec3d7c7f850d' },
                    name: { type: 'string', example: 'Magasin Lyon Central' },
                    address: { type: 'string', example: '12 Rue Victor Hugo, 69002 Lyon' },
                    site: { type: 'string', example: 'Site Lyon' },
                    isActive: { type: 'boolean', example: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Reservation: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '6ae0d74109191f5333264b20' },
                    toolId: { type: 'string', example: '6ade322b464dec3d7c7f8599' },
                    borrowerId: { type: 'string', example: '6ade0a2713010478d5b86d75' },
                    storeId: { type: 'string', example: '6ade322b464dec3d7c7f850d' },
                    startDate: { type: 'string', format: 'date-time', example: '2026-11-01T10:00:00.000Z' },
                    endDate: { type: 'string', format: 'date-time', example: '2026-11-01T14:00:00.000Z' },
                    durationHours: { type: 'number', example: 4 },
                    status: { type: 'string', enum: ['CONFIRMEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'], example: 'CONFIRMEE' }
                }
            }
        }
    },
    paths: {
        '/status': {
            get: {
                summary: 'Verifier l\'etat d\'installation de l\'application',
                tags: ['Installation'],
                responses: {
                    200: {
                        description: 'Statut de l\'application',
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
<<<<<<< HEAD
                                        isInstalled: { type: 'boolean' },
=======
                                        isInstalled: { type: 'boolean', example: true },
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
                                        installedAt: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/installation': {
            post: {
<<<<<<< HEAD
                tags: ['Installation'],
                summary: 'Install the application and create the first admin',
                description: 'Can only be used before the application has been installed.',
                security: [],
=======
                summary: 'Installation One-Shot et creation du premier admin',
                tags: ['Installation'],
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
<<<<<<< HEAD
                            schema: { $ref: '#/components/schemas/InstallRequest' }
=======
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password'],
                                properties: {
                                    name: { type: 'string', example: 'Aziz Admin' },
                                    email: { type: 'string', example: 'admin@toolshare.com' },
                                    password: { type: 'string', example: 'AdminPassword123' }
                                }
                            }
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
                        }
                    }
                },
                responses: {
<<<<<<< HEAD
                    201: { description: 'Application installed.' },
                    400: { $ref: '#/components/responses/BadRequest' }
                }
            }
        },
        '/api/v1/auth/register': {
            post: {
                tags: ['Authentication'],
                summary: 'Register a user',
                description: 'The first account is created as ADMIN without a token. Afterwards, MANAGER or ADMIN authentication is required. Managers can create USER accounts; admins can create USER or MANAGER accounts.',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RegisterRequest' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Account created.' },
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    403: { $ref: '#/components/responses/Forbidden' }
=======
                    201: { description: 'Application installee avec succes' },
                    400: { description: 'Application deja installee' }
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
                }
            }
        },
        '/api/v1/auth/login': {
            post: {
<<<<<<< HEAD
                tags: ['Authentication'],
                summary: 'Log in',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginRequest' }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'JWT and public user profile.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        token: { type: 'string' },
                                        user: { $ref: '#/components/schemas/User' }
                                    }
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },
        '/api/v1/auth/users': {
            get: {
                tags: ['Users'],
                summary: 'List users',
                description: 'Available to ADMIN and MANAGER.',
                responses: {
                    200: { description: 'List of public user profiles.' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    403: { $ref: '#/components/responses/Forbidden' }
                }
            }
        },
        '/api/v1/auth/desactive/{id}': {
            put: {
                tags: ['Users'],
                summary: 'Activate or deactivate a user',
                description: 'Available to ADMIN.',
                parameters: [{ $ref: '#/components/parameters/Id' }],
=======
                summary: 'Connexion utilisateur et obtention du JWT',
                tags: ['Authentification'],
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
<<<<<<< HEAD
                                required: ['isActive'],
                                properties: { isActive: { type: 'boolean' } }
=======
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', example: 'admin@toolshare.com' },
                                    password: { type: 'string', example: 'AdminPassword123' }
                                }
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
                            }
                        }
                    }
                },
                responses: {
<<<<<<< HEAD
                    200: { description: 'User status updated.' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    403: { $ref: '#/components/responses/Forbidden' }
=======
                    200: { description: 'Authentification reussie, retourne le token JWT' },
                    401: { description: 'Identifiants invalides' }
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
                }
            }
        },
        '/api/v1/me': {
            get: {
<<<<<<< HEAD
                tags: ['Authentication'],
                summary: 'Get current user profile',
                responses: {
                    200: { description: 'Authenticated user profile.' },
                    401: { $ref: '#/components/responses/Unauthorized' }
=======
                summary: 'Profil de l\'utilisateur connecte',
                tags: ['Authentification'],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Profil utilisateur' },
                    401: { description: 'Non authentifie' }
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
                }
            }
        },
        '/api/v1/stores': {
            get: {
<<<<<<< HEAD
                tags: ['Stores'],
                summary: 'List stores',
                parameters: [{
                    name: 'isActive',
                    in: 'query',
                    schema: { type: 'boolean' },
                    description: 'Filter by active status.'
                }],
                responses: {
                    200: { description: 'Stores matching the requested filters.' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            },
            post: {
                tags: ['Stores'],
                summary: 'Create a store',
                description: 'Available to ADMIN.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/StoreInput' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Store created.' },
                    400: { $ref: '#/components/responses/BadRequest' },
                    403: { $ref: '#/components/responses/Forbidden' }
                }
            }
        },
        '/api/v1/stores/{id}': {
            parameters: [{ $ref: '#/components/parameters/Id' }],
            get: {
                tags: ['Stores'],
                summary: 'Get a store',
                responses: {
                    200: { description: 'Store details.' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            },
            put: {
                tags: ['Stores'],
                summary: 'Update a store',
                description: 'Available to ADMIN.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/StoreInput' }
                        }
                    }
                },
                responses: {
                    200: { description: 'Store updated.' },
                    403: { $ref: '#/components/responses/Forbidden' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        },
        '/api/v1/stores/{id}/toggle-status': {
            patch: {
                tags: ['Stores'],
                summary: 'Activate or deactivate a store',
                description: 'Available to ADMIN.',
                parameters: [{ $ref: '#/components/parameters/Id' }],
=======
                summary: 'Lister les magasins',
                tags: ['Stores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'isActive', in: 'query', schema: { type: 'boolean' } }
                ],
                responses: {
                    200: { description: 'Liste des magasins' }
                }
            },
            post: {
                summary: 'Creer un magasin (Admin)',
                tags: ['Stores'],
                security: [{ bearerAuth: [] }],
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
<<<<<<< HEAD
                                required: ['isActive'],
                                properties: { isActive: { type: 'boolean' } }
=======
                                required: ['name', 'address', 'site'],
                                properties: {
                                    name: { type: 'string', example: 'Magasin Lyon Central' },
                                    address: { type: 'string', example: '12 Rue Victor Hugo' },
                                    site: { type: 'string', example: 'Site Lyon' }
                                }
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
                            }
                        }
                    }
                },
                responses: {
<<<<<<< HEAD
                    200: { description: 'Store status updated.' },
                    403: { $ref: '#/components/responses/Forbidden' },
                    404: { $ref: '#/components/responses/NotFound' }
=======
                    201: { description: 'Magasin cree' },
                    400: { description: 'Nom deja pris ou donnees invalides' },
                    403: { description: 'Acces refuse' }
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
                }
            }
        },
        '/api/v1/stores/{id}/assign-manager': {
            patch: {
<<<<<<< HEAD
                tags: ['Stores'],
                summary: 'Assign a manager to a store',
                description: 'Available to ADMIN. The manager must be active and not assigned to a different store.',
                parameters: [{ $ref: '#/components/parameters/Id' }],
=======
                summary: 'Affecter un gestionnaire a un magasin',
                tags: ['Stores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['managerId'],
<<<<<<< HEAD
                                properties: { managerId: { type: 'string' } }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Manager assigned.' },
                    400: { $ref: '#/components/responses/BadRequest' },
                    403: { $ref: '#/components/responses/Forbidden' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        },
        '/api/v1/tools': {
            get: {
                tags: ['Tools'],
                summary: 'List tools',
                description: 'Managers only see tools in their assigned store. includeDisabled is available to admins.',
                parameters: [
                    {
                        name: 'storeId',
                        in: 'query',
                        schema: { type: 'string' },
                        description: 'Store filter (ADMIN only).'
                    },
                    {
                        name: 'status',
                        in: 'query',
                        schema: { $ref: '#/components/schemas/ToolStatus' }
                    },
                    {
                        name: 'includeDisabled',
                        in: 'query',
                        schema: { type: 'boolean', default: false }
                    }
                ],
                responses: {
                    200: { description: 'Tools matching the requested filters.' },
                    400: { $ref: '#/components/responses/BadRequest' },
                    403: { $ref: '#/components/responses/Forbidden' }
                }
            },
            post: {
                tags: ['Tools'],
                summary: 'Create a tool',
                description: 'Available to ADMIN or MANAGER. Managers create tools in their assigned store.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ToolInput' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Tool created.' },
                    400: { $ref: '#/components/responses/BadRequest' },
                    403: { $ref: '#/components/responses/Forbidden' },
                    409: { description: 'A tool with this reference already exists.' }
                }
            }
        },
        '/api/v1/tools/{id}': {
            parameters: [{ $ref: '#/components/parameters/Id' }],
            get: {
                tags: ['Tools'],
                summary: 'Get a tool',
                parameters: [{
                    name: 'includeDisabled',
                    in: 'query',
                    schema: { type: 'boolean', default: false }
                }],
                responses: {
                    200: { description: 'Tool details.' },
                    403: { $ref: '#/components/responses/Forbidden' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            },
            patch: {
                tags: ['Tools'],
                summary: 'Update a tool',
                description: 'Managers can only update tools in their assigned store and cannot move tools between stores.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ToolUpdate' }
                        }
                    }
                },
                responses: {
                    200: { description: 'Tool updated.' },
                    400: { $ref: '#/components/responses/BadRequest' },
                    403: { $ref: '#/components/responses/Forbidden' },
                    404: { $ref: '#/components/responses/NotFound' },
                    409: { description: 'A tool with this reference already exists.' }
                }
            },
            delete: {
                tags: ['Tools'],
                summary: 'Disable a tool',
                description: 'Soft-deletes a tool by setting isActive to false.',
                responses: {
                    200: { description: 'Tool disabled.' },
                    403: { $ref: '#/components/responses/Forbidden' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        },
        '/api/v1/tools/{id}/status': {
            patch: {
                tags: ['Tools'],
                summary: 'Set tool status',
                parameters: [{ $ref: '#/components/parameters/Id' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['status'],
                                properties: { status: { $ref: '#/components/schemas/ToolStatus' } }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Tool status updated.' },
                    400: { $ref: '#/components/responses/BadRequest' },
                    403: { $ref: '#/components/responses/Forbidden' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        },
        '/api/v1/reservations': {
            get: {
                tags: ['Reservations'],
                summary: 'List reservations',
                description: 'Users see their own reservations. Managers see reservations for their assigned store.',
                parameters: [
                    {
                        name: 'status',
                        in: 'query',
                        schema: { $ref: '#/components/schemas/ReservationStatus' }
                    },
                    { name: 'toolId', in: 'query', schema: { type: 'string' } },
                    { name: 'storeId', in: 'query', schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Reservations matching the request and caller access.' },
                    403: { $ref: '#/components/responses/Forbidden' }
                }
            },
            post: {
                tags: ['Reservations'],
                summary: 'Create a reservation',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ReservationInput' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Reservation created with status CONFIRMEE.' },
                    400: { $ref: '#/components/responses/BadRequest' },
                    404: { $ref: '#/components/responses/NotFound' },
                    409: { description: 'The requested tool has an overlapping reservation.' }
                }
            }
        },
        '/api/v1/reservations/overdue': {
            get: {
                tags: ['Reservations'],
                summary: 'List overdue reservations',
                description: 'MANAGER only. Lists in-progress reservations past their due date for the manager’s assigned store.',
                responses: {
                    200: { description: 'Overdue reservations.' },
                    403: { $ref: '#/components/responses/Forbidden' }
                }
            }
        },
        '/api/v1/reservations/{id}': {
            parameters: [{ $ref: '#/components/parameters/Id' }],
            get: {
                tags: ['Reservations'],
                summary: 'Get a reservation',
                responses: {
                    200: { description: 'Reservation details.' },
                    403: { $ref: '#/components/responses/Forbidden' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        },
        '/api/v1/reservations/{id}/cancel': {
            patch: {
                tags: ['Reservations'],
                summary: 'Cancel a reservation',
                parameters: [{ $ref: '#/components/parameters/Id' }],
                responses: {
                    200: { description: 'Reservation cancelled.' },
                    400: { $ref: '#/components/responses/BadRequest' },
                    403: { $ref: '#/components/responses/Forbidden' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        },
        '/api/v1/reservations/{id}/checkout': {
            patch: {
                tags: ['Reservations'],
                summary: 'Check out a reserved tool',
                description: 'MANAGER only. Changes a confirmed reservation to EN_COURS, records actualStartDate, and marks the available tool as unavailable. A tool with an active loan cannot be checked out again.',
                parameters: [{ $ref: '#/components/parameters/Id' }],
                responses: {
                    200: { description: 'Tool checked out and reservation started.' },
                    400: { $ref: '#/components/responses/BadRequest' },
                    403: { $ref: '#/components/responses/Forbidden' },
                    404: { $ref: '#/components/responses/NotFound' },
                    409: { description: 'The reservation or tool is not available for check-out.' }
                }
            }
        },
        '/api/v1/reservations/{id}/checkin': {
            patch: {
                tags: ['Reservations'],
                summary: 'Check in a returned tool',
                description: 'MANAGER only. Completes an in-progress reservation and records actualEndDate. Damaged tools become INDISPONIBLE; tools in good condition become DISPONIBLE.',
                parameters: [{ $ref: '#/components/parameters/Id' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['returnCondition'],
                                properties: {
                                    returnCondition: {
                                        type: 'string',
                                        enum: ['BON', 'ENDOMMAGE']
                                    }
=======
                                properties: {
                                    managerId: { type: 'string', example: '6ade3246e37a57591c919184' }
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
                                }
                            }
                        }
                    }
                },
                responses: {
<<<<<<< HEAD
                    200: { description: 'Tool returned and reservation completed.' },
                    400: { $ref: '#/components/responses/BadRequest' },
                    403: { $ref: '#/components/responses/Forbidden' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        }
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        parameters: {
            Id: {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
            }
        },
        responses: {
            BadRequest: {
                description: 'Invalid request.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' }
                    }
                }
            },
            Unauthorized: {
                description: 'Authentication required or token is invalid.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' }
                    }
                }
            },
            Forbidden: {
                description: 'The authenticated user does not have permission.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' }
                    }
                }
            },
            NotFound: {
                description: 'The requested resource was not found.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' }
                    }
                }
            }
        },
        schemas: {
            Error: {
                type: 'object',
                properties: { message: { type: 'string' } }
            },
            InstallRequest: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                    name: { type: 'string', example: 'ToolShare Admin' },
                    email: { type: 'string', format: 'email', example: 'admin@example.com' },
                    password: { type: 'string', minLength: 8, format: 'password' }
                }
            },
            RegisterRequest: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                    name: { type: 'string', example: 'Alex Smith' },
                    email: { type: 'string', format: 'email', example: 'alex@example.com' },
                    password: { type: 'string', minLength: 8, format: 'password' },
                    role: { type: 'string', enum: ['USER', 'MANAGER', 'ADMIN'], default: 'USER' }
                }
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', format: 'password' }
                }
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'USER'] },
                    storeId: { type: 'string', nullable: true },
                    isActive: { type: 'boolean' }
                }
            },
            StoreInput: {
                type: 'object',
                required: ['name', 'address', 'site'],
                properties: {
                    name: { type: 'string', minLength: 2 },
                    address: { type: 'string' },
                    site: { type: 'string' }
                }
            },
            ToolStatus: {
                type: 'string',
                enum: ['DISPONIBLE', 'INDISPONIBLE', 'HORS_SERVICE']
            },
            ToolInput: {
                type: 'object',
                required: ['reference', 'name'],
                properties: {
                    reference: { type: 'string' },
                    name: { type: 'string', minLength: 2 },
                    description: { type: 'string' },
                    storeId: { type: 'string', description: 'Required for ADMIN; managers use their assigned store.' },
                    status: { $ref: '#/components/schemas/ToolStatus' }
                }
            },
            ToolUpdate: {
                type: 'object',
                properties: {
                    reference: { type: 'string' },
                    name: { type: 'string', minLength: 2 },
                    description: { type: 'string' },
                    status: { $ref: '#/components/schemas/ToolStatus' },
                    storeId: { type: 'string', description: 'ADMIN only.' }
                }
            },
            ReservationStatus: {
                type: 'string',
                enum: ['CONFIRMEE', 'EN_COURS', 'TERMINEE', 'ANNULEE']
            },
            ReservationInput: {
                type: 'object',
                required: ['toolId', 'storeId', 'startDate', 'durationHours'],
                properties: {
                    toolId: { type: 'string' },
                    storeId: { type: 'string' },
                    startDate: { type: 'string', format: 'date-time' },
                    durationHours: { type: 'number', minimum: 1 }
=======
                    200: { description: 'Gestionnaire affecte' },
                    400: { description: 'Regle exclusive non respectee ou role non gestionnaire' },
                    403: { description: 'Admin requis' },
                    404: { description: 'Magasin ou gestionnaire introuvable' }
                }
            }
        },
        '/api/v1/stores/{id}/toggle-status': {
            patch: {
                summary: 'Activer/desactiver un magasin (Soft-delete)',
                tags: ['Stores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['isActive'],
                                properties: {
                                    isActive: { type: 'boolean', example: false }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Statut mis a jour' }
                }
            }
        },
        '/api/v1/reservations': {
            get: {
                summary: 'Lister les reservations selon role',
                tags: ['Reservations'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'status', in: 'query', schema: { type: 'string' } },
                    { name: 'storeId', in: 'query', schema: { type: 'string' } },
                    { name: 'toolId', in: 'query', schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Liste des reservations' }
                }
            },
            post: {
                summary: 'Creer une reservation avec anti-chevauchement',
                tags: ['Reservations'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['toolId', 'storeId', 'startDate', 'durationHours'],
                                properties: {
                                    toolId: { type: 'string', example: '6ade322b464dec3d7c7f8599' },
                                    storeId: { type: 'string', example: '6ade322b464dec3d7c7f850d' },
                                    startDate: { type: 'string', format: 'date-time', example: '2026-11-01T10:00:00.000Z' },
                                    durationHours: { type: 'number', minimum: 1, example: 4 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Reservation creee' },
                    400: { description: 'Champs manquants ou date dans le passe' },
                    409: { description: 'Conflit de chevauchement temporel' }
                }
            }
        },
        '/api/v1/reservations/{id}/cancel': {
            patch: {
                summary: 'Annuler une reservation',
                tags: ['Reservations'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Reservation annulee' },
                    400: { description: 'Statut incompatible' },
                    403: { description: 'Acces refuse' }
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4
                }
            }
        }
    }
<<<<<<< HEAD
}
=======
};
>>>>>>> 991892313cb589c36a5f23924528d8d4e38a74a4

module.exports = swaggerDocument;
