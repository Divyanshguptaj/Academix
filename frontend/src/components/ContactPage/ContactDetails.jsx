import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { IoCall } from "react-icons/io5";
import { BiWorld } from "react-icons/bi";

const contactDetails = [
  {
    Icon: HiChatBubbleLeftRight,
    heading: "Chat with us",
    description: "Our friendly team is here to help.",
    detail: "info@academix.com",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    Icon: BiWorld,
    heading: "Visit us",
    description: "Come and say hello at our office HQ.",
    detail: "Akshya Nagar 1st Block, Rammurthy Nagar, Bangalore – 560016",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    Icon: IoCall,
    heading: "Call us",
    description: "Mon – Fri, 8 am to 5 pm",
    detail: "+123 456 7869",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
];

const ContactDetails = () => {
  return (
    <div className="flex flex-col gap-5">
      {contactDetails.map(({ Icon, heading, description, detail, color, bg }) => (
        <div
          key={heading}
          className="flex gap-4 items-start bg-[#1d1d1d] rounded-2xl p-5 border border-gray-800"
        >
          <div className={`flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-xl ${bg}`}>
            <Icon size={22} className={color} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-white text-base">{heading}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
            <p className={`text-sm font-medium mt-0.5 ${color}`}>{detail}</p>
          </div>
        </div>
      ))}

      {/* Extra CTA */}
      <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5 mt-1">
        <p className="text-sm text-gray-300 leading-relaxed">
          Have a general question?{" "}
          <span className="text-yellow-400 font-medium">
            Fill out the form and we'll get back to you within 24 hours.
          </span>
        </p>
      </div>
    </div>
  );
};

export default ContactDetails;
