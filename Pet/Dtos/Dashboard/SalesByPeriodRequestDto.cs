namespace Pet.Dtos.Dashboard
{
    public class SalesByPeriodRequestDto
    {
        public string Period { get; set; } // "Day", "Month", "Year"
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
