namespace Pet.Datas
{
    public enum ShippingMethod
    {   Road,
        Air,
        Sea,
        Rail
    }

    public enum OrderStatus
    {
        confirming,
        packing,
        shipping,
        delivered,
        cancelled
    }
}
