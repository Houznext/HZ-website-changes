import React, { useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import apiClient from "@/utils/apiClient";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import SEO from "@/components/SEO";
import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Building2,
  Paintbrush,
  Sun,
  HardHat,
  Sofa,
  Scale,
  MessageCircle,
  Send,
  Shield,
  Users,
  Star,
  Home,
} from "lucide-react";

const SERVICE_CATEGORIES = [
  {
    key: "real-estate",
    label: "Real Estate",
    icon: Building2,
    description: "Buy, sell, or rent properties",
  },
  {
    key: "interiors",
    label: "Interior Design",
    icon: Paintbrush,
    description: "Transform your living spaces",
  },
  {
    key: "construction",
    label: "Construction",
    icon: HardHat,
    description: "Custom home building",
  },
  {
    key: "solar",
    label: "Solar Energy",
    icon: Sun,
    description: "Solar panel installation",
  },
  {
    key: "furniture",
    label: "Furniture & Decor",
    icon: Sofa,
    description: "Home furnishing solutions",
  },
  {
    key: "legal",
    label: "Legal Services",
    icon: Scale,
    description: "Property legal assistance",
  },
] as const;

type ServiceKey = (typeof SERVICE_CATEGORIES)[number]["key"];

const CITIES = [
  "Hyderabad",
  "Mumbai",
  "Bangalore",
  "Pune",
  "Chennai",
  "Delhi NCR",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Other",
];

const TRUST_STATS = [
  { value: "10K+", label: "Happy Customers", icon: Users },
  { value: "4.8", label: "Average Rating", icon: Star },
  { value: "50+", label: "Cities Served", icon: MapPin },
  { value: "24hr", label: "Response Time", icon: Clock },
];

function ContactUs() {
  const [selectedService, setSelectedService] = useState<ServiceKey | "">("");
  const [selectedCity, setSelectedCity] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    emailAddress: "",
    tellUsMore: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormChange = (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const markTouched = (name: string) =>
    setTouched((t) => ({ ...t, [name]: true }));

  const errors = useMemo(() => {
    const e: Record<string, string | undefined> = {};
    if (!/^[A-Za-z\s]{2,}$/.test(form.firstName || "")) {
      e.firstName = "Please enter a valid first name.";
    }
    if (form.lastName && !/^[A-Za-z\s]{2,}$/.test(form.lastName)) {
      e.lastName = "Please enter a valid last name.";
    }
    if (!/^\d{10}$/.test(form.contactNumber || "")) {
      e.contactNumber = "Enter a valid 10-digit number.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress || "")) {
      e.emailAddress = "Please enter a valid email.";
    }

    return e;
  }, [form]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      contactNumber: true,
      emailAddress: true,
      tellUsMore: true,
    });
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        contactNumber: form.contactNumber,
        emailAddress: form.emailAddress,
        tellUsMore: form.tellUsMore,
        serviceType:
          SERVICE_CATEGORIES.find((s) => s.key === selectedService)?.label ||
          "General Inquiry",
        city: selectedCity || undefined,
      };

      const res = await apiClient.post(apiClient.URLS.contact_us, payload);
      if (res.status === 201) {
        setSubmittedName(form.firstName);
        setSubmitted(true);
        setForm({
          firstName: "",
          lastName: "",
          contactNumber: "",
          emailAddress: "",
          tellUsMore: "",
        });
        setSelectedService("");
        setSelectedCity("");
        setTouched({});
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setSubmittedName("");
  };

  if (submitted) {
    return (
      <>
        <SEO
          title="Thank You | OneCasa"
          description="Thank you for contacting OneCasa. Our team will reach out to you shortly."
        />
        <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 px-4">
          <div className="max-w-lg w-full text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Thank you, {submittedName}!
              </h1>

              <p className="text-gray-600 mb-2 text-sm md:text-base">
                We&apos;ve received your inquiry and our team will reach out
                within <strong>24 hours</strong>.
              </p>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 my-6 text-left">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-[#3586FF] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Check your phone!
                    </p>
                    <p className="text-sm text-gray-600">
                      We&apos;ve sent a confirmation via SMS &amp; WhatsApp to
                      your registered number.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button
                  onClick={resetForm}
                  className="flex-1 py-2.5 px-5 bg-[#3586FF] text-white text-sm font-medium rounded-lg hover:bg-[#2b6fd9] transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Another Inquiry
                </Button>
                <Button
                  href="/"
                  className="flex-1 w-full py-2.5 px-5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </Button>
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Need immediate help?{" "}
              <Link
                href="tel:+918897574909"
                className="text-[#3586FF] font-medium hover:underline"
              >
                Call +91 8897574909
              </Link>
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Contact OneCasa | Real Estate, Interiors, Solar & Home Services"
        description="Get in touch with OneCasa for property listings, interior design, solar installation, custom construction, furniture, and legal services. Our experts respond within 24 hours across Hyderabad, Mumbai, Bangalore, Pune, Chennai."
        keywords="OneCasa contact, property inquiry, interiors contact, construction contact, solar installation contact, Hyderabad real estate, furniture inquiry, legal services property"
        breadcrumbs={[
          { name: "Home", item: "https://www.onecasa.in/" },
          { name: "Contact Us", item: "https://www.onecasa.in/contact-us" },
        ]}
        faq={[
          {
            question: "How quickly does OneCasa respond to inquiries?",
            answer:
              "Our team typically responds within 24 hours via phone, email, or WhatsApp. For urgent queries, you can call us directly at +918897574909.",
          },
          {
            question: "What services can I inquire about?",
            answer:
              "You can contact us about real estate (buy/sell/rent), interior design, custom construction, solar panel installation, furniture & home decor, and property legal services.",
          },
          {
            question: "Which cities does OneCasa operate in?",
            answer:
              "OneCasa operates across major Indian cities including Hyderabad, Mumbai, Bangalore, Pune, Chennai, Delhi NCR, Kolkata, Ahmedabad, and more.",
          },
        ]}
        service={{
          name: "OneCasa Customer Support and Consultation",
          description:
            "Professional consultation for real estate, interior design, solar, construction, furniture, and legal services",
          areaServed: CITIES.filter((c) => c !== "Other"),
          providerType: "LocalBusiness",
        }}
      />

      <div className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-sm py-4 px-4">
        <h1 className="text-xl font-bold text-gray-900 text-center">
          Contact Us
        </h1>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f2340] to-[#0a1628]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#3586FF] blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#8A2BE2] blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left: Info */}
            <div className="text-white">
              <div className="hidden lg:block">
                <span className="inline-block px-3 py-1 rounded-full label-text font-medium bg-[#3586FF]/20 text-[#A4C7FF] border border-[#3586FF]/30 mb-4">
                  We&apos;re here to help
                </span>
                <h1 className="text-3xl lg:text-4xl xl:text-[42px] font-bold leading-tight mb-4">
                  Let&apos;s build your
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3586FF] to-[#A4C7FF]">
                    {" "}
                    dream together
                  </span>
                </h1>
                <p className="text-white/70 text-base lg:text-lg max-w-lg mb-8">
                  Whether it&apos;s finding the perfect property, designing your
                  interiors, or going solar — our experts are one message away.
                </p>
              </div>

              {/* Service Selection */}
              <div className="mb-8">
                <p className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                  What are you looking for?
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SERVICE_CATEGORIES.map(
                    ({ key, label, icon: Icon, description }) => (
                      <button
                        key={key}
                        onClick={() =>
                          setSelectedService((prev) =>
                            prev === key ? "" : key
                          )
                        }
                        className={clsx(
                          "text-left p-3 rounded-xl border transition-all duration-200 group",
                          selectedService === key
                            ? "bg-[#3586FF]/15 border-[#3586FF]/50 shadow-lg shadow-[#3586FF]/10"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        )}
                      >
                        <Icon
                          className={clsx(
                            "w-5 h-5 mb-1.5",
                            selectedService === key
                              ? "text-[#3586FF]"
                              : "text-white/50 group-hover:text-white/70"
                          )}
                        />
                        <p
                          className={clsx(
                            "text-sm font-medium",
                            selectedService === key
                              ? "text-white"
                              : "text-white/80"
                          )}
                        >
                          {label}
                        </p>
                        <p className="text-[11px] text-white/40 mt-0.5 hidden md:block">
                          {description}
                        </p>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Trust Stats */}
              <div className="hidden lg:grid grid-cols-4 gap-4 mb-8">
                {TRUST_STATS.map(({ value, label, icon: Icon }) => (
                  <div key={label} className="text-center">
                    <Icon className="w-5 h-5 text-[#3586FF] mx-auto mb-1" />
                    <p className="text-xl font-bold text-white">{value}</p>
                    <p className="text-[11px] text-white/50">{label}</p>
                  </div>
                ))}
              </div>

              {/* Contact Cards */}
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                  Reach us directly
                </p>
                <div className="space-y-2">
                  <Link
                    href="tel:+918897574909"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#3586FF]/20 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-[#3586FF]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        +91 8897574909
                      </p>
                      <p className="label-text text-white/50">
                        Mon – Sat, 9 AM – 7 PM
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="mailto:sales@onecasa.in"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#3586FF]/20 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-[#3586FF]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        sales@onecasa.in
                      </p>
                      <p className="label-text text-white/50">
                        We reply within 24 hours
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="https://api.whatsapp.com/send/?phone=918897574909&text&type=phone_number&app_absent=0"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        WhatsApp Us
                      </p>
                      <p className="label-text text-white/50">
                        Quick chat with our team
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-10 h-10 rounded-lg bg-[#8A2BE2]/20 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[#8A2BE2]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Hyderabad, India
                      </p>
                      <p className="label-text text-white/50">
                        Headquarters &amp; Operations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
                <div className="bg-gradient-to-r from-[#3586FF] to-[#2b6fd9] px-6 py-4">
                  <h2 className="text-lg font-bold text-white">
                    Get a Free Consultation
                  </h2>
                  <p className="text-blue-100 text-sm mt-0.5">
                    Fill in your details and our experts will call you back
                  </p>
                </div>

                <form onSubmit={onSubmit} className="p-5 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput
                      name="firstName"
                      type="text"
                      label="First name *"
                      value={form.firstName}
                      onChange={(e) =>
                        handleFormChange("firstName", e.target.value)
                      }
                      onBlur={() => markTouched("firstName")}
                      outerInptCls="bg-gray-50 border-gray-200 focus-within:border-[#3586FF] focus-within:ring-2 focus-within:ring-[#3586FF]/10"
                      labelCls="label-text font-medium text-gray-700"
                      placeholder="e.g., Sachin"
                      className="text-sm text-gray-900 placeholder:text-gray-400"
                      required
                      errorMsg={
                        touched.firstName ? errors.firstName : undefined
                      }
                    />

                    <CustomInput
                      name="lastName"
                      type="text"
                      label="Last name"
                      value={form.lastName}
                      onChange={(e) =>
                        handleFormChange("lastName", e.target.value)
                      }
                      onBlur={() => markTouched("lastName")}
                      outerInptCls="bg-gray-50 border-gray-200 focus-within:border-[#3586FF] focus-within:ring-2 focus-within:ring-[#3586FF]/10"
                      labelCls="label-text font-medium text-gray-700"
                      placeholder="e.g., Chauhan"
                      className="text-sm text-gray-900 placeholder:text-gray-400"
                      errorMsg={touched.lastName ? errors.lastName : undefined}
                    />

                    <CustomInput
                      name="contactNumber"
                      label="Mobile number *"
                      value={form.contactNumber}
                      onChange={(e) =>
                        handleFormChange(
                          "contactNumber",
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      onBlur={() => markTouched("contactNumber")}
                      outerInptCls="bg-gray-50 border-gray-200 focus-within:border-[#3586FF] focus-within:ring-2 focus-within:ring-[#3586FF]/10"
                      labelCls="label-text font-medium text-gray-700"
                      placeholder="10-digit mobile number"
                      className="text-sm text-gray-900 placeholder:text-gray-400"
                      type="number"
                      required
                      errorMsg={
                        touched.contactNumber
                          ? errors.contactNumber
                          : undefined
                      }
                    />

                    <CustomInput
                      name="emailAddress"
                      type="email"
                      label="Email address *"
                      value={form.emailAddress}
                      onChange={(e) =>
                        handleFormChange("emailAddress", e.target.value)
                      }
                      onBlur={() => markTouched("emailAddress")}
                      outerInptCls="bg-gray-50 border-gray-200 focus-within:border-[#3586FF] focus-within:ring-2 focus-within:ring-[#3586FF]/10"
                      labelCls="label-text font-medium text-gray-700"
                      placeholder="you@example.com"
                      className="text-sm text-gray-900 placeholder:text-gray-400"
                      required
                      errorMsg={
                        touched.emailAddress
                          ? errors.emailAddress
                          : undefined
                      }
                    />

                    {/* City Selection */}
                    <div className="md:col-span-2">
                      <label className="label-text font-medium text-gray-700 mb-1.5 block">
                        Your city
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 label-text px-3 text-sm text-gray-900 focus:outline-none focus:border-[#3586FF] focus:ring-2 focus:ring-[#3586FF]/10 transition-colors"
                      >
                        <option value="">Select your city</option>
                        {CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <CustomInput
                        name="tellUsMore"
                        type="textarea"
                        label="Tell us about your requirement *"
                        value={form.tellUsMore}
                        onChange={(e) =>
                          handleFormChange("tellUsMore", e.target.value)
                        }
                        onBlur={() => markTouched("tellUsMore")}
                        outerInptCls="bg-gray-50 border-gray-200 focus-within:border-[#3586FF] focus-within:ring-2 focus-within:ring-[#3586FF]/10"
                        labelCls="label-text font-medium text-gray-700"
                        placeholder={
                          selectedService === "real-estate"
                            ? "e.g., Looking for a 3BHK apartment in Gachibowli, budget 80L-1Cr..."
                            : selectedService === "interiors"
                              ? "e.g., Need full home interior for 1500 sqft apartment, modern style..."
                              : selectedService === "solar"
                                ? "e.g., Monthly electricity bill ~₹5000, rooftop area available..."
                                : selectedService === "construction"
                                  ? "e.g., 200 sq yard plot in Narsingi, want 2-floor construction..."
                                  : selectedService === "furniture"
                                    ? "e.g., Need living room furniture, L-shaped sofa, TV unit..."
                                    : selectedService === "legal"
                                      ? "e.g., Property registration, title verification for plot in Banjara Hills..."
                                      : "Describe your requirement: budget, timeline, city, preferences..."
                        }
                        className="min-h-[100px] text-sm text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    <Button
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      className={clsx(
                        "w-full py-3 rounded-lg text-white text-sm font-semibold",
                        "transition-all duration-300 flex items-center justify-center gap-2",
                        isValid && !isSubmitting
                          ? "bg-[#3586FF] hover:bg-[#2b6fd9] shadow-lg shadow-[#3586FF]/25 hover:shadow-[#3586FF]/40"
                          : "bg-gray-300 cursor-not-allowed"
                      )}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        <>
                          Get Free Consultation
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 label-text text-gray-500">
                      <Shield className="w-3.5 h-3.5" />
                      <span>
                        Your information is secure. We never share your data.
                      </span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile contact strip */}
      <section className="lg:hidden bg-white border-t border-gray-100 px-4 py-6">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="tel:+918897574909"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-100"
          >
            <Phone className="w-4 h-4 text-[#3586FF]" />
            <div>
              <p className="label-text font-semibold text-gray-900">Call Us</p>
              <p className="text-[11px] text-gray-500">+91 8897574909</p>
            </div>
          </Link>
          <Link
            href="https://api.whatsapp.com/send/?phone=918897574909&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-green-50 border border-green-100"
          >
            <MessageCircle className="w-4 h-4 text-green-600" />
            <div>
              <p className="label-text font-semibold text-gray-900">WhatsApp</p>
              <p className="text-[11px] text-gray-500">Quick chat</p>
            </div>
          </Link>
          <Link
            href="mailto:sales@onecasa.in"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50 border border-purple-100"
          >
            <Mail className="w-4 h-4 text-[#8A2BE2]" />
            <div>
              <p className="label-text font-semibold text-gray-900">Email</p>
              <p className="text-[11px] text-gray-500">sales@onecasa.in</p>
            </div>
          </Link>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-orange-50 border border-orange-100">
            <Clock className="w-4 h-4 text-orange-600" />
            <div>
              <p className="label-text font-semibold text-gray-900">Hours</p>
              <p className="text-[11px] text-gray-500">Mon-Sat, 9-7 PM</p>
            </div>
          </div>
        </div>

        {/* Mobile Trust Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-gray-100">
          {TRUST_STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="w-4 h-4 text-[#3586FF] mx-auto mb-0.5" />
              <p className="text-sm font-bold text-gray-900">{value}</p>
              <p className="text-[10px] text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Office / Map Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Visit Our Office
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Come say hello at our headquarters
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#3586FF]/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-[#3586FF]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    OneCasa Headquarters
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Hyderabad, Telangana, India
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Business Hours
                    </p>
                    <p className="label-text text-gray-500">
                      Monday – Saturday: 9:00 AM – 7:00 PM
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="label-text text-gray-500">+91 8897574909</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="label-text text-gray-500">sales@onecasa.in</p>
                  </div>
                </div>
              </div>

              <Link
                href="https://maps.google.com/?q=OneCasa+Hyderabad"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Get Directions
              </Link>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-[300px] md:h-[350px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.31698398!2d78.24322854371356!3d17.412608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="OneCasa Office Location"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default withGeneralLayout(ContactUs);
