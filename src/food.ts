/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Food {

    @Property()
    public docType?: string;

    @Property()
    public OrderId?: string;

    @Property()
	public FoodId?: string;

    @Property()
	public ConsumerId?: string;

    @Property()
	public ManufactureId?: string;

    @Property()
	public WholesalerId?: string;

    @Property()
	public RetailerId?: string;

    @Property()
	public LogisticsId?: string;

    @Property()
	public Status?: string;

    @Property()
	public RawFoodProcessDate?: string;

    @Property()
	public ManufactureProcessDate?: string;

    @Property()
	public WholesaleProcessDate?: string;

    @Property()
	public ShippingProcessDate?: string;

    @Property()
	public RetailProcessDate?: string;

    @Property()
	public OrderPrice?: number;

    @Property()
	public ShippingPrice?: number;

    @Property()
	public DeliveryDate?: string;
}
