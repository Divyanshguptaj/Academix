import ContactUsForm from "./ContactUsForm";

const ContactForm = () => {
  return (
    <div className="bg-[#1d1d1d] rounded-2xl border border-gray-800 p-6 sm:p-8">
      <div className="mb-7">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Send us a message
        </h2>
        <p className="text-gray-400 text-sm mt-2">
          Tell us more about yourself and what you have in mind.
        </p>
      </div>
      <ContactUsForm />
    </div>
  );
};

export default ContactForm;
