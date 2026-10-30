const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { calculateEndDate, calculateDurationHours, isOverlapping, validateNoOverlap } = require('../../src/utils/date.util');

describe('TOOL-68 : Tests unitaires de l anti chevauchement et calculs de date', () => {
    it(`calculateEndDate calcule l'heure de fin exacte à partir de la durée`, () => {
        const start = '2026-11-01T10:00:00.000Z';
        const end = calculateEndDate(start, 4);

        assert.equal(end.toISOString(), '2026-11-01T14:00:00.000Z');
    })

    it(`calculateDurationHours`, () => {
        const start = '2026-11-01T10:00:00.000Z';
        const end = '2026-11-01T15:30:00.000Z';
        const duration = calculateDurationHours(start, end);
        assert.equal(duration, 5.5);
    });
})

describe(`isOverlappin - Intersection d'intervalles temporels`, () => {
    it('détecte un chevauchement partiel', () => {
        const overlap = isOverlapping('2026-11-01T10:00:00Z', '2026-11-01T14:00:00Z', '2026-11-01T12:00:00Z', '2026-11-01T16:00:00Z');
        assert.equal(overlap, true);
    });

    it('detecte un chevauchement englobant (inclus dedans)', () => {
        const overlap = isOverlapping('2026-11-01T10:00:00Z', '2026-11-01T16:00:00Z', '2026-11-01T12:00:00Z', '2026-11-01T14:00:00Z');
        assert.equal(overlap, true);
    })

    it(`autorise des reservations strictement consecutives (fin = debut)`, () => {
        const overlap = isOverlapping('2026-11-01T10:00:00Z', '2026-11-01T14:00:00Z', '2026-11-01T14:00:00Z', '2026-11-01T18:00:00Z')
        assert.equal(overlap, false);
    })

    it('autorise des creneaux disjoints sans collision', () => {
        const overlap = isOverlapping('2026-11-01T10:00:00Z', '2026-11-01T12:00:00Z', '2026-11-01T15:00:00Z', '2026-11-01T18:00:00Z');
        assert.equal(overlap, false);
    })
})

describe('validateNoOverlap - validation et rejet 409', () => {
    const existing = [
        {
            _id: 'res-1',
            startDate: '2026-11-01T10:00:00Z',
            endDate: '2026-11-01T14:00:00Z',
            status: 'CONFIRMEE'
        },
        {
            _id: 'res-2',
            startDate: '2026-11-01T16:00:00Z',
            endDate: '2026-11-01T20:00:00Z',
            status: 'EN_COURS'
        },
        {
            _id: 'res-3',
            startDate: '2026-11-01T10:00:00Z',
            endDate: '2026-11-01T14:00:00Z',
            status: 'ANNULEE'
        }
    ];

    it(`lève une erreur 409 en cas de conflit avec une reservation CONFIRMEE`, () => {
        assert.throws(() => {
            validateNoOverlap(existing, '2026-11-01T12:00:00Z', '2026-11-01T15:00:00Z');
        }, (err) => {
            assert.equal(err.statusCode, 409);
            assert.match(err.message, /Conflit de réservation/);
            return true
        })
    })

    it('lève une erreur 409 en cas de conflit avec une réservation EN_COURS', () => {
        assert.throws(() => {
            validateNoOverlap(existing, '2026-11-01T18:00:00Z', '2026-11-01T22:00:00Z');
        }, (err) => {
            assert.equal(err.statusCode, 409);
            return true;
        });
    });

    it('ignore les reservations avc le statut annule',()=>{
        const result = validateNoOverlap(existing,'2026-11-02T10:00:00Z','2026-11-02T14:00:00Z')
        assert.equal(result,true);
    })

    it(`rejette les dates invalides ou debut >= fin avec une erreur 400`,()=>{
        assert.throws(()=>{
            validateNoOverlap(existing,'2026-11-01T14:00:00Z','2026-11-01T10:00:00Z');
        },(err)=>{
            assert.equal(err.statusCode,400);
            return true
        })
    })
})