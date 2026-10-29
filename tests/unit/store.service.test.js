const assert = require('node:assert/strict');
const {describe,it,beforeEach} = require('node:test');

const storeService = require('../../src/services/store.service');
const storeRepository = require('../../src/repositories/store.repository');
const userRepository = require('../../src/repositories/user.repository');

describe('TOOL-67 : Tests unitaire de StoreService avec Mocks',()=>{
    describe('createStore',()=>{
        it('crée un magasin avec succes si le nom est disponible',async()=>{
            storeRepository.findByName = async () => null;
            storeRepository.create = async (data) => ({_id:'store-1',...data,isActive:true});
            const result = await storeService.createStore({name:'Magasin Nord',address:'Lille',site:'Nord'});

            assert.equal(result._id,'store-1');
            assert.equal(result.name,'Magasin Nord');
        })

        it('leve une erreur 400 si un magasin avec le meme nom existe deja',async() =>{
            storeRepository.findByName = async () => ({_id: 'store-existing',name:'Magasin Nord'});
            await assert.rejects(
                async() => storeService.createStore({name:'Magasin Nord',address:'Lille',site:'Nord'}),
                (err)=>{
                    assert.equal(err.statusCode,400);
                    assert.match(err.message,/deja/i)
                    return true
                }
            )
        })
    })

    describe('getStoreById',()=>{
        it(`retourne le magasin si l'id existe`,async()=>{
            storeRepository.findById = async (id) => ({_id:id,name:'Magain Lyon',isActive:true});

            const result = await storeService.getStoreById('store-123');

            assert.equal(result._id,'store-123');
        });

        it('leve une erreur 404 si le magasin est introuvable',async () =>{
            storeRepository.findById = async () => null;
            
            await assert.rejects(
                async () => storeService.getStoreById('store-inexistant'),(err)=>{
                    assert.equal(err.statusCode,404);
                    return true;
                }
            )
        })
    })

    describe('toggleStoreStatus(soft delete',()=>{
        it('desactive le magasin avec isActive:false',async()=>{
            storeRepository.findById = async(id) => ({
                _id:id,name:'Magasin Paris',isActive:true
            });

            storeRepository.update = async(id,data) => ({
                _id:id,isActive:data.isActive
            });

            const result = await storeService.toggleStoreStatus('store-1',false);

            assert.equal(result.isActive,false);
        })
    })

    describe('assignManager',()=>{
        const activeStore = {
            _id:'store-1',
            name:'Magasin Paris',
            isActive:true
        }

        const validManager = {
            _id:'user-1',
            name:'Karim',
            role:'GESTIONNAIRE',
            isActive: true,
            storeId:null
        }

        it('affecte le gestionnaire au magasin avec succes',async()=>{
            storeRepository.findById = async () => activeStore;
            userRepository.findById = async () =>  ({...validManager});
            userRepository.update = async(id,data) => ({...validManager,storeId:date.storeId});

            const result = await storeService.assignManager('store-1','user-1');

            assert.equal(result.store._id,'store-1');
        })

        it('leve une erreur 400 si le magasin est inactif', async()=>{
            storeRepository.findById = async () => ({
                ...activeStore,isActive:false
            });

            await asser.rejects(
                async () => storeService.assignManager('store-1','user-1'),
                (err) =>{
                    assert.equal(err.statusCode,400);

                    assert.match(err.message,/inactif/i);
                    return true;
                }
            )
        });

        it(`leve une erreur 400 si l'utilisateur n'a pas le role gestionnaire`,async()=>{
            storeRepository.findById = async () => activeStore;
            userRepository.findById = async () => activeStore;

            userRepository.findById = async () => ({...validManager,role:'USER'});

            await asssert.rejects(
                async() => storeService.assignManager('store-1','user-1'),
                (err) =>{
                    assert.equal(err.statusCode,400);
                    assert.match(err.message,/role/i);
                    return true;
                }
            )
        })

        it(`leve une erreur 400 si le gestionnaire est deja affecte a un autre magasin`,async () =>{
            storeRepository.findById = async () => activeStore;

            userRepository.findById = async () => ({ ...validManager,storeId:'store-autre'});

            await assert.rejects(
                async () =>
                    storeService.assignManager('store-1','user-1'),(err)=>{
                        assert.equal(err.statusCode,400);
                        assert.match(err.message,/dejaaffecte/i);
                        return true
                    }
            )
        })
    })
})