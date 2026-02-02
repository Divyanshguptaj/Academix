import { useEffect, useState } from "react"
import { AiOutlineMenu, AiOutlineShoppingCart, AiOutlineClose } from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { useSelector, useDispatch } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"
import Logo from '../../assets/Logo/logoAcademix.png'
import { NavbarLinks } from "../../data/navbar-links"
import { fetchCategories } from "../../slices/courseSlice"
import { getUserImage, createImageErrorHandler } from "../../utils/imageUtils"

function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  const storeCategories = useSelector((state) => state.course.categories)
  const location = useLocation()
  const dispatch = useDispatch()
  const [subLinks, setSubLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true)
      try {
        const categories = await dispatch(fetchCategories()).unwrap()
        setSubLinks(categories)
      } catch (error) {
        if (error.name !== 'ConditionError') {
          console.log("Could not fetch Categories.", error)
        } else {
          console.debug("Categories fetch condition returned false, using categories from store.")
          setSubLinks(storeCategories)
        }
      }
      setLoading(false)
    }
    getCategories()
  }, [dispatch])

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
        setCatalogOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    setCatalogOpen(false)
  }

  return (
    <div
      className={`sticky top-0 z-50 flex h-16 sm:h-14 items-center justify-center border-b border-b-richblack-300 ${
        location.pathname !== "/" ? "bg-richblack-800" : ""
      } transition-all duration-200 shadow-sm`}
    >
      <div className="flex w-full max-w-maxContent items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center"
        >
          <img 
            src={Logo} 
            alt="Academix Logo" 
            className="w-[60x] h-[60px] object-contain transition-transform duration-200 group-hover:scale-105"
            loading="lazy" 
          />
          <span className="text-blue-100 font-bold ml-[-40px] text-xl ">
            cademix
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block">
          <ul className="flex gap-x-4 xl:gap-x-6 text-richblack-300">
            {NavbarLinks.map((link, index) => (
              <li key={index} className="relative">
                {link.title === "Catalog" ? (
                  <div
                    className={`group relative flex cursor-pointer items-center gap-1 py-2 px-3 rounded-md transition-colors duration-200 hover:bg-richblack-700 ${
                      matchRoute("/catalog/:catalogName")
                        ? "text-yellow-400"
                        : "text-richblack-300 hover:text-white"
                    }`}
                  >
                    <p className="text-sm lg:text-base">{link.title}</p>
                    <BsChevronDown className="text-xs" />
                    
                    {/* Desktop Dropdown */}
                    <div className="invisible absolute left-1/2 top-full z-[1000] flex w-[280px] xl:w-[320px] translate-x-[-50%] translate-y-2 flex-col rounded-lg bg-white shadow-xl border border-richblack-200 p-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="absolute left-[50%] top-0 -z-10 h-4 w-4 translate-x-[-50%] translate-y-[-50%] rotate-45 bg-white border-l border-t border-richblack-200"></div>
                      {loading ? (
                        <p className="text-center py-4 text-richblack-600">Loading...</p>
                      ) : subLinks.length ? (
                        <div className="max-h-[400px] overflow-y-auto">
                          {subLinks.map((subLink, i) => (
                            <Link
                              to={`/catalog/${subLink.name
                                .split(" ")
                                .join("-")
                                .toLowerCase()}`}
                              className="block px-4 py-3 text-black hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors duration-150 border-b border-richblack-100 last:border-b-0"
                              key={i}
                            >
                              <p className="text-sm font-medium">{subLink.name}</p>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-4 text-richblack-500">No Courses Found</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link to={link?.path} className="block">
                    <p
                      className={`py-2 px-3 rounded-md text-sm lg:text-base transition-colors duration-200 hover:bg-richblack-700 ${
                        matchRoute(link?.path)
                          ? "text-yellow-400"
                          : "text-richblack-300 hover:text-white"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Right side buttons */}
        <div className="flex gap-x-2 sm:gap-x-4 items-center">
          {/* Shopping Cart - Show on medium screens and up */}
          {user && user?.accountType === "Student" && (
            <Link 
              to="/dashboard/cart" 
              className="relative text-white text-xl sm:text-2xl p-2 rounded-full hover:bg-richblack-700 transition-colors duration-200"
              onClick={closeMobileMenu}
            >
              <AiOutlineShoppingCart />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white animate-pulse">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Profile Image */}
          {token !== null && user?.image && (
            <Link 
              to="/dashboard/my-profile"
              className="hidden sm:block"
              onClick={closeMobileMenu}
            >
              <img
                src={getUserImage(user)}
                alt="Profile"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-400 hover:border-yellow-400 transition-colors duration-200 object-cover"
                onError={createImageErrorHandler(user)}
                loading="lazy"
              />
            </Link>
          )}

          {/* Auth Buttons - Desktop only */}
          {token === null && (
            <div className="hidden lg:flex gap-3">
              <Link to="/login">
                <button className="border border-richblack-400 text-richblack-300 hover:text-white hover:border-white bg-transparent px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-richblack-700">
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm">
                  Signup
                </button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2 rounded-md hover:bg-richblack-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <AiOutlineClose fontSize={20} />
            ) : (
              <AiOutlineMenu fontSize={20} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-16 sm:top-14 left-0 right-0 bg-richblack-900 border-t border-richblack-700 lg:hidden z-50 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-6">
            <ul className="flex flex-col gap-2 text-richblack-300">
              {NavbarLinks.map((link, index) => (
                <li key={index}>
                  {link.title === "Catalog" ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => setCatalogOpen(!catalogOpen)}
                        className={`flex items-center justify-between w-full py-3 px-4 rounded-lg transition-colors duration-200 hover:bg-richblack-800 ${
                          matchRoute("/catalog/:catalogName") ? "text-yellow-400" : ""
                        }`}
                      >
                        <span className="text-base font-medium">{link.title}</span>
                        <BsChevronDown className={`transition-transform duration-200 ${catalogOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Mobile Catalog Dropdown */}
                      {catalogOpen && (
                        <div className="ml-4 space-y-1 border-l-2 border-blue-600 pl-4">
                          {loading ? (
                            <p className="py-2 text-richblack-400">Loading...</p>
                          ) : subLinks.length ? (
                            subLinks.map((subLink, i) => (
                              <Link
                                to={`/catalog/${subLink.name
                                  .split(" ")
                                  .join("-")
                                  .toLowerCase()}`}
                                onClick={closeMobileMenu}
                                className="block py-2 px-3 text-richblack-300 hover:text-white hover:bg-richblack-800 rounded-md transition-colors duration-200"
                                key={i}
                              >
                                <p className="text-sm">{subLink.name}</p>
                              </Link>
                            ))
                          ) : (
                            <p className="py-2 text-richblack-400 text-sm">No Courses Found</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={link.path}
                      onClick={closeMobileMenu}
                      className={`block py-3 px-4 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-richblack-800 ${
                        matchRoute(link?.path) ? "text-yellow-400" : "hover:text-white"
                      }`}
                    >
                      {link.title}
                    </Link>
                  )}
                </li>
              ))}

              {/* Mobile Profile Link */}
              {token !== null && user?.image && (
                <li className="border-t border-richblack-700 pt-4">
                  <Link
                    to="/dashboard/my-profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-richblack-800 transition-colors duration-200"
                  >
                    <img
                      src={getUserImage(user)}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border border-blue-400 object-cover"
                      onError={createImageErrorHandler(user)}
                      loading="lazy"
                    />
                    <span className="text-white font-medium">My Profile</span>
                  </Link>
                </li>
              )}

              {/* Mobile Auth Buttons */}
              {token === null && (
                <li className="border-t border-richblack-700 pt-4">
                  <div className="flex flex-col gap-3">
                    <Link to="/login" onClick={closeMobileMenu}>
                      <button className="w-full border border-richblack-400 text-richblack-300 bg-transparent px-4 py-3 rounded-lg text-base font-medium hover:bg-richblack-800 hover:text-white transition-colors duration-200">
                        Login
                      </button>
                    </Link>
                    <Link to="/signup" onClick={closeMobileMenu}>
                      <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors duration-200">
                        Signup
                      </button>
                    </Link>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar