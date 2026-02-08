import { ACCOUNT_TYPE } from '../utils/constants'

// Unified sidebar links with role-based access control
export const sidebarLinks = [
    // Student Links
    {
        id: 1,
        name: "My Profile",
        path: '/dashboard/my-profile',
        icon: 'VscAccount',
        allowedRoles: [ACCOUNT_TYPE.STUDENT, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.ADMIN],
    },
    {
        id: 2,
        name: "Enrolled Courses",
        path: '/dashboard/enrolled-courses',
        icon: 'VscExtensions',
        allowedRoles: [ACCOUNT_TYPE.STUDENT],
    },
    {
        id: 3,
        name: "Cart",
        path: '/dashboard/cart',
        icon: 'AiOutlineShoppingCart',
        allowedRoles: [ACCOUNT_TYPE.STUDENT],
    },
    {
        id: 4,
        name: "Smart Study Companion",
        path: '/dashboard/smart-study',
        icon: 'VscBook',
        allowedRoles: [ACCOUNT_TYPE.STUDENT, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.ADMIN],
    },
    {
        id: 5,
        name: "AI Study Assistant",
        path: '/dashboard/ai-study-assistant',
        icon: 'VscHubot',
        allowedRoles: [ACCOUNT_TYPE.STUDENT, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.ADMIN],
    },
    {
        id: 6,
        name: "Text to Video Summarizer",
        path: '/dashboard/text-to-video-summarizer',
        icon: 'BiVideo',
        allowedRoles: [ACCOUNT_TYPE.STUDENT, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.ADMIN],
    },

    // Instructor Links
    {
        id: 7,
        name: "Instructors",
        path: '/dashboard/instructor',
        icon: 'VscProject',
        allowedRoles: [ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.ADMIN],
    },
    {
        id: 8,
        name: "My Courses",
        path: '/dashboard/instructor-courses',
        icon: 'VscVm',
        allowedRoles: [ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.ADMIN],
    },
    {
        id: 9,
        name: "Add Courses",
        path: '/dashboard/add-courses',
        icon: 'VscAdd',
        allowedRoles: [ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.ADMIN],
    },

    // Admin Links
    {
        id: 10,
        name: "Admin Dashboard",
        path: '/admin/dashboard',
        icon: 'VscDashboard',
        allowedRoles: [ACCOUNT_TYPE.ADMIN],
    },
    {
        id: 11,
        name: "User Management",
        path: '/admin/users',
        icon: 'VscAccount',
        allowedRoles: [ACCOUNT_TYPE.ADMIN],
    },
    {
        id: 12,
        name: "Instructor Management",
        path: '/admin/instructors',
        icon: 'VscProject',
        allowedRoles: [ACCOUNT_TYPE.ADMIN],
    },
    {
        id: 13,
        name: "Course Management",
        path: '/admin/courses',
        icon: 'VscVm',
        allowedRoles: [ACCOUNT_TYPE.ADMIN],
    },
    {
        id: 14,
        name: "Refund Management",
        path: '/admin/refunds',
        icon: 'VscHistory',
        allowedRoles: [ACCOUNT_TYPE.ADMIN],
    },
    {
        id: 15,
        name: "Reports & Analytics",
        path: '/admin/analytics',
        icon: 'VscGraphLine',
        allowedRoles: [ACCOUNT_TYPE.ADMIN],
    },
    {
        id: 16,
        name: "System Settings",
        path: '/admin/settings',
        icon: 'VscSettingsGear',
        allowedRoles: [ACCOUNT_TYPE.ADMIN],
    },
]

// Helper function to get links for a specific role
export const getSidebarLinksForRole = (userRole) => {
    return sidebarLinks.filter(link => link.allowedRoles.includes(userRole))
}

// Helper function to check if a user has access to a specific path
export const hasAccessToPath = (userRole, path) => {
    const link = sidebarLinks.find(l => l.path === path)
    return link ? link.allowedRoles.includes(userRole) : false
}
