public record Order(int Id, decimal Total, bool Paid);

public static class Revenue
{
    public static decimal From(IEnumerable<Order> orders)
    {
        ⟦decimal sum = 0m;
        foreach (var order in orders)
        {
            if (order.Paid) sum += order.Total;
        }
        return sum;⟧
    }
}
