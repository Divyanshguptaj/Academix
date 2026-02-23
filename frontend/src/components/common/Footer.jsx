import { Link } from "react-router-dom";
import Logo from "../../assets/Logo/logoAcademix.png";
import {
  FaTwitter,
  FaLinkedinIn,
  FaGithub,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

const footerLinks = [
  {
    heading: "Learn",
    links: [
      { label: "All Courses", to: "/catalog/all" },
      { label: "Catalog", to: "/catalog" },
      { label: "Enrolled Courses", to: "/dashboard/enrolled-courses" },
      { label: "Smart Study", to: "/dashboard/smart-study" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Contact Us", to: "/contact" },
      { label: "Careers", to: "/contact" },
      { label: "Blog", to: "/" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", to: "/contact" },
      { label: "Terms of Service", to: "/" },
      { label: "Privacy Policy", to: "/" },
      { label: "Cookie Policy", to: "/" },
    ],
  },
];

const socialLinks = [
  { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
  { icon: FaLinkedinIn, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: FaGithub, href: "https://github.com", label: "GitHub" },
  { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
  { icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
];

const Footer = () => {
  return (
    <footer className="bg-[#1d1d1d] text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main grid */}
        <div className="py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand column */}
          <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block">
              <img
                src={Logo}
                alt="Academix"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Empowering learners worldwide with accessible, flexible, and
              high-quality education for a digital-first world.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-1">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-yellow-400 hover:text-black transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map(({ heading, links }) => (
            <div key={heading} className="flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-yellow-400">
                {heading}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Academix. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-sm text-gray-500">
            <Link to="/" className="hover:text-white transition-colors duration-150">
              Privacy
            </Link>
            <Link to="/" className="hover:text-white transition-colors duration-150">
              Terms
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors duration-150">
              Contact
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
