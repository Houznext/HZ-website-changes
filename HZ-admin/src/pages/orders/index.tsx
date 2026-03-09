import withAdminLayout from "@/src/common/AdminLayout";
import OrderManagementPortal from "@/src/components/OrderManagement";

const OrdersPage = () => {
    return (
        <div className="w-full">
            <OrderManagementPortal />;
        </div>
    )
}
export default withAdminLayout(OrdersPage);