import ContactUsForm from "../../ContactPage/ContactUsForm";

const ContactFormSection = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-yellow-400 text-xs font-semibold uppercase tracking-widest">Contact</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">Get in Touch</h2>
        <p className="text-gray-400 mt-3 text-sm sm:text-base">
          We&apos;d love to hear from you. Fill out the form and we&apos;ll get back to you.
        </p>
      </div>
      <ContactUsForm />
    </div>
  );
};

export default ContactFormSection;