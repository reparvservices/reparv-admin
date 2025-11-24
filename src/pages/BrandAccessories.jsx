import { useState, useEffect } from "react";
import Products from "../components/brandAccessories/Products";
import OrderDetails from "../components/brandAccessories/OrderDetails";

const BrandAccessories = () => {
  const [selectedTable, setSelectedTable] = useState("Products");

  return (
    <div>
      {selectedTable === "Products" && (
        <Products selectedTable={selectedTable} setSelectedTable={setSelectedTable} />
      )}
      {selectedTable === "Orders" && (
        <OrderDetails selectedTable={selectedTable} setSelectedTable={setSelectedTable} />
      )}
    </div>
  );
};

export default BrandAccessories;
