const assert = require('node:assert/strict');
const { describe, it, beforeEach } = require('node:test');
const mongoose = require('mongoose');

const installationService = require('../../src/services/installation.service');
const installationRepository = require('../../src/repositories/installation.repository');
const userRepository = require('../../src/repositories/user.repository');

describe('TOOL-66 : Tests unitaires de InstallationService avec Mocks', () => {
    const mockSession = {
        startTransaction: () => { },
        commitTransaction: async () => { },
        abortTransaction: async () => { },
        endSession: () => { }
    };

    beforeEach(() => {
        mongoose.startSession = async () => mockSession;
    })

    describe('checkInstallationStatus', () => {
        it('retourne isInstalled: false si aucun document d installation n existe', async () => {
            installationRepository.getInstallation = async () => null;

            const status = await installationService.checkInstallationStatus();

            assert.equal(status.isInstalled, false);
        });

        it('retourne isInstalled: true avec la date si l application est installe', async () => {
            const date = new Date('2026-10-25T12:00:00Z');

            installationRepository.getInstallation = async () => ({
                isInstalled: true, installedAt: date
            });

            const status = await installationService.checkInstallationStatus();

            assert.equal(status.isInstalled, true);

            assert.equal(status.installedAt, date);
        })
    })

    describe('installApp', () => {
        it('leve une erreur 400 si l application est deja installe', async () => {
            installationRepository.getInstallation = async () => ({
                isInstalled: true
            })

            await assert.rejects(
                async () => installationService.installApp({
                    name: 'Admin',
                    email: 'admin@toolshare.com',
                    password: 'Password123'
                }),
                (err) => {
                    assert.equal(err.statusCode, 400);
                    assert.match(err.message, /deja/i);
                    return true
                }
            )
        })

        it('installe l application et crée le premier administrateur avec succes', async () => {
            installationRepository.getInstallation = async () => null;
            userRepository.create = async (data) => ({
                _id: 'admin-123',
                ...data
            })
            installationRepository.createInstallation = async (data) => ({
                ...data
            });

            const result = await installationService.installApp({
                name: 'Aziz Admin',
                email: 'admin@toolshare.com',
                password: 'Password'
            })

            assert.equal(result.admin.name, 'Aziz Admin');

            assert.equal(result.admin.email, 'admin@toolshare.com');

            assert.equal(result.admin.role, 'ADMIN');

            assert.ok(result.installedAt);
        })

        it('annule la transaction (abortTransaction) en cas d erreur lors de la creation', async () => {
            installationRepository.getInstallation = async () => null;
            let aborted = false;

            mongoose.startSession = async () => ({
                ...mockSession,
                abortTransaction: async () => { aborted = true; }
            });

            userRepository.create = async () => {
                throw new Error('Erreur BDD simulée');
            }

            await assert.rejects(
                async () => installationService.installApp({
                    name: 'Admin',
                    email: 'a@a.com',
                    password: 'pwd'
                }),
                (err) => {
                    assert.equal(err.message, 'Erreur BDD simulée');
                    return true;
                }
            );

            assert.equal(aborted, true, 'La transaction doit être annulée en cas d\'erreur');

        })
    })
})