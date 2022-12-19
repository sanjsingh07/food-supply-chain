/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import {Food} from './food';

@Info({title: 'FoodContract', description: 'Smart contract for Supply Chain'})
export class FoodContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        let orderId = "order_1"
        let consumerId = "consumer_1"
        let orderPrice = 0
        let shippingPrice = 0

        this.setupFoodSupplyChainOrder(ctx, orderId,consumerId,orderPrice,shippingPrice);
        // const assets: Food[] = [{
        //         OrderId:       orderId,
        //         ConsumerId:    consumerId,
        //         OrderPrice:    orderPrice,
        //         ShippingPrice: shippingPrice,
        //         Status:        "order initiated"
        //     }];
        
        // for (const asset of assets) {
        //     asset.docType = 'asset';
        //     await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
        //     console.info(`Asset ${asset.ID} initialized`);
        // }
    }

    // CreateAsset issues a new asset to the world state with given details.
    @Transaction()
    public async setupFoodSupplyChainOrder(ctx: Context, orderId: string, consumerId: string, orderPrice: number, shippingPrice: number): Promise<void> {
        const asset: Food = {
            OrderId:       orderId,
            ConsumerId:    consumerId,
            OrderPrice:    orderPrice,
            ShippingPrice: shippingPrice,
            Status:        "order initiated"
        };
        await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(asset)));
        console.info(`Asset ${asset.OrderId} initialized`);
    }

    // @Transaction()
    // public async createRawFood(ctx: Context, orderId: string, consumerId: string, orderPrice: number, shippingPrice: number): Promise<void> {
    //     // ctx.stub.getArgs
    //     const asset: Food = {
    //         FoodId:       "FISH_1",
    //         ConsumerId:    consumerId,
    //         RawFoodProcessDate :  String(Date.now),
    //         OrderPrice:    orderPrice,
    //         ShippingPrice: shippingPrice,
    //         Status:        "raw food created"
    //     };
    //     await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(asset)));
    //     console.info(`Asset ${asset.OrderId} initialized`);
    // }

    // ReadAsset returns the asset stored in the world state with given id.
    @Transaction(false)
    public async ReadAsset(ctx: Context, id: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        console.log("printing assetJSON : ", assetJSON)
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    @Transaction()
    public async UpdateAsset(ctx: Context, id: string, color: string, size: number, owner: string, appraisedValue: number): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedAsset)));
    }

    // DeleteAsset deletes an given asset from the world state.
    @Transaction()
    public async DeleteAsset(ctx: Context, id: string): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, id: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    @Transaction()
    public async TransferAsset(ctx: Context, id: string, newOwner: string): Promise<void> {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        asset.Owner = newOwner;
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
    }

    // GetAllAssets returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllAssets(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({Key: result.value.key, Record: record});
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    @Transaction()
    @Returns('string')
    public async createRawFood(ctx: Context, orderId: string): Promise<string> {   
        const exists = await this.AssetExists(ctx, orderId);
        if (!exists) {
            throw new Error(`The asset ${orderId} orderId does not exist`);
        }

        let foodJSON = await this.ReadAsset(ctx, orderId);
        const asset:Food = JSON.parse(foodJSON);

        if(asset.Status == "order initiated"){
            asset.FoodId = "FISH_1"
            asset.Status = "raw food created"
            asset.ManufactureProcessDate = String(Date.now)

            await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(asset)));

        }  else {
            // asset.Status = "Error"
            console.log("Order not initiated yet")
        }

        // await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(asset)));

        return "success"
    }

    @Transaction()
    @Returns('string')
    public async manufactureProcessing(ctx: Context, orderId: string): Promise<string> {   
        const exists = await this.AssetExists(ctx, orderId);
        if (!exists) {
            throw new Error(`The asset ${orderId} orderId does not exist`);
        }

        let foodJSON = await this.ReadAsset(ctx, orderId);
        const asset:Food = JSON.parse(foodJSON);

        if(asset.Status == "raw food created"){
            asset.ManufactureId = "Manufacture_1"
            asset.Status = "manufacture Process"
            asset.ManufactureProcessDate = String(Date.now)

            await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(asset)));

        }  else {
            // asset.Status = "Error"
            console.log("Raw food not initiated yet")
        }

        // await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(asset)));

        return "success"
    }

    @Transaction()
    @Returns('string')
    public async wholesalerDistribute(ctx: Context, orderId: string): Promise<string> {   
        const exists = await this.AssetExists(ctx, orderId);
        if (!exists) {
            throw new Error(`The asset ${orderId} orderId does not exist`);
        }

        let foodJSON = await this.ReadAsset(ctx, orderId);
        const asset:Food = JSON.parse(foodJSON);

        if(asset.Status == "manufacture Process"){
            asset.WholesalerId = "Wholesaler_1"
            asset.Status = "wholesaler distribute"
            asset.WholesaleProcessDate = String(Date.now)

            await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(asset)));

        }  else {
            // asset.Status = "Error"
            console.log("Wholesaler not initiated yet")
        }

        // await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(asset)));

        return "success"
    }

    @Transaction()
    @Returns('string')
    public async initiateShipment(ctx: Context, orderId: string): Promise<string> {   
        const exists = await this.AssetExists(ctx, orderId);
        if (!exists) {
            throw new Error(`The asset ${orderId} orderId does not exist`);
        }

        let foodJSON = await this.ReadAsset(ctx, orderId);
        const asset:Food = JSON.parse(foodJSON);

        if(asset.Status == "wholesaler distribute"){
            asset.LogisticsId = "LogisticsId_1"
            asset.Status = "initiated shipment"
            asset.ShippingProcessDate = String(Date.now)

            await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(asset)));

        }  else {
            console.log("Wholesaler not initiated yet")
        }


        return "success"
    }

    @Transaction()
    @Returns('string')
    public async deliverToRetail(ctx: Context, orderId: string): Promise<string> {   
        const exists = await this.AssetExists(ctx, orderId);
        if (!exists) {
            throw new Error(`The asset ${orderId} orderId does not exist`);
        }

        let foodJSON = await this.ReadAsset(ctx, orderId);
        const asset:Food = JSON.parse(foodJSON);

        if(asset.Status == "initiated shipment"){
            asset.RetailerId = "Retailer_1"
            asset.Status = "Retailer started"
            asset.RetailProcessDate = String(Date.now)

            await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(asset)));

        }  else {
            console.log("Shipment not initiated yet")
        }

        return "success"
    }

    @Transaction()
    @Returns('string')
    public async completeOrder(ctx: Context, orderId: string): Promise<string> {   
        
        const exists = await this.AssetExists(ctx, orderId);
        if (!exists) {
            throw new Error(`The asset ${orderId} orderId does not exist`);
        }

        let foodJSON = await this.ReadAsset(ctx, orderId);
        const asset:Food = JSON.parse(foodJSON);

        if(asset.Status == "Retailer started"){

            asset.Status = "Consumer received order"
            asset.DeliveryDate = String(Date.now)

            await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(asset)));

        } else {
            console.log("Retailer not initiated yet")
        }

        return "success"
    }

    @Transaction(false)
    @Returns('string')
    public async query(ctx: Context, ENTITY: string): Promise<string> {

        if(ENTITY == ""){
            return "Incorrect argument. Expected ENIITY Name"
        }


        return JSON.stringify(ctx.stub.getState(ENTITY));
    }

}
