const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'ToolShare API',
        version: '1.0.0',
        description: 'Documentation interactive de l\'API ToolShare - Plateforme de pret et gestion d\'outillage multi magasins avec detection d\'anti chevauchement temporel'
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 5000}`,
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
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        isInstalled: { type: 'boolean', example: true },
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
                summary: 'Installation One-Shot et creation du premier admin',
                tags: ['Installation'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password'],
                                properties: {
                                    name: { type: 'string', example: 'Aziz Admin' },
                                    email: { type: 'string', example: 'admin@toolshare.com' },
                                    password: { type: 'string', example: 'AdminPassword123' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Application installee avec succes' },
                    400: { description: 'Application deja installee' }
                }
            }
        },
        '/api/v1/auth/login': {
            post: {
                summary: 'Connexion utilisateur et obtention du JWT',
                tags: ['Authentification'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', example: 'admin@toolshare.com' },
                                    password: { type: 'string', example: 'AdminPassword123' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Authentification reussie, retourne le token JWT' },
                    401: { description: 'Identifiants invalides' }
                }
            }
        },
        '/api/v1/me': {
            get: {
                summary: 'Profil de l\'utilisateur connecte',
                tags: ['Authentification'],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Profil utilisateur' },
                    401: { description: 'Non authentifie' }
                }
            }
        },
        '/api/v1/stores': {
            get: {
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
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'address', 'site'],
                                properties: {
                                    name: { type: 'string', example: 'Magasin Lyon Central' },
                                    address: { type: 'string', example: '12 Rue Victor Hugo' },
                                    site: { type: 'string', example: 'Site Lyon' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Magasin cree' },
                    400: { description: 'Nom deja pris ou donnees invalides' },
                    403: { description: 'Acces refuse' }
                }
            }
        },
        '/api/v1/stores/{id}/assign-manager': {
            patch: {
                summary: 'Affecter un gestionnaire a un magasin',
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
                                required: ['managerId'],
                                properties: {
                                    managerId: { type: 'string', example: '6ade3246e37a57591c919184' }
                                }
                            }
                        }
                    }
                },
                responses: {
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
                }
            }
        }
    }
};

module.exports = swaggerDocument;
