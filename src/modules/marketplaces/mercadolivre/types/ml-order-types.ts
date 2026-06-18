export type MlNotification = {
    _id: string;
    topic: string;
    resource: string;
    user_id: number;
    application_id: number;
    attempts: number;
    sent: string;
    received: string;
};

export type MlBuyer = {
    id: number;
    nickname: string;
    email: string;
    phone: {
        area_code: string;
        number: string;
    };
    first_name: string;
    last_name: string;
};

export type MlOrderItem = {
    item: {
        id: string;
        title: string;
        quantity: number;
        unit_price: number;
    };
    full_unit_price: number;
    quantity: number;
    sale_fee: number;
    listing_type_id: string;
};

export type MlPayment = {
    id: number;
    status: string;
    transaction_amount: number;
    installments: number;
    payment_method_id: string;
    payment_type: string;
};

export type MlShipping = {
    id: number;
    status: string;
    shipping_type: string;
    cost: number;
    free_shipping: boolean;
    receiver_address: {
        state: { id: string; name: string };
        city: { id: string; name: string };
        zip_code: string;
        address_line: string;
        street_name: string;
        street_number: string;
        comment: string;
    };
};

export type MlOrder = {
    id: number;
    date_created: string;
    date_closed: string;
    last_updated: string;
    buyer: MlBuyer;
    shipping?: MlShipping;
    payments: MlPayment[];
    order_items: MlOrderItem[];
    status: string;
    total_amount: number;
    paid_amount: number;
    currency_id: string;
};
