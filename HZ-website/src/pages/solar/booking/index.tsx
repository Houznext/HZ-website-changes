import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import SolarBookingView from "@/components/SolarPage/SolarBookingView";

const SolarBookingPage = () => {
    console.log('booking page');
    return <><SolarBookingView /></>;
};

export default withGeneralLayout(SolarBookingPage);