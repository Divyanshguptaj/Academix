import mailSender from "../utils/mailSender.js";

export const contactUsController = async (req, res) => {
  try {
      const { firstname, lastname, email, phoneNo, message, countrycode } = req.body;

    if (!firstname || !email || !message || !phoneNo || !countrycode) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const emailBody = `
      <h2>Contact Us Message</h2>
      <p><strong>Name:</strong> ${firstname} ${lastname || ""}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${countrycode} ${phoneNo}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    await mailSender(
      "divyansh.gupta.engineer@gmail.com", // Your receiving admin/support email
      "New Contact Us Message from StudyNotion",
      emailBody
    );

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("Contact Us Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
