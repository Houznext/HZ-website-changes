import { CreateDailyProgressDto } from './Custombuilder/daily-progress/dto/daily-progress.dto';

export const otpEmailTemplate = (otp: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code - OneCasa Real Estate</title>
    <link href="https://fonts.googleapis.in/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Poppins', sans-serif; margin: 0; padding: 0; background-color: #f7f9fc;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 auto; max-width: 680px;">
        <!-- Header Section -->
        <tr>
            <td style="padding: 30px 20px 20px; text-align: center; background: linear-gradient(135deg, #1a3a4a 0%, #2c5f7e 100%);">
                <img alt="OneCasa Real Estate" src="https://onecasa.in/_next/image?url=%2Fimages%2Flogobw.png&w=2048&q=75" height="60px" style="display: block; margin: 0 auto;" />
                <p style="color: #ffffff; font-size: 16px; margin: 15px 0 0; letter-spacing: 0.5px; font-weight: 300;">One Roof, Every Solution</p>
            </td>
        </tr>
        
        <!-- Main Content -->
        <tr>
            <td style="padding: 40px 30px; background: #ffffff; border-left: 1px solid #e6e9ed; border-right: 1px solid #e6e9ed;">
                <h1 style="font-size: 26px; color: #2c5f7e; text-align: center; margin: 0 0 15px; font-weight: 600;">Verify Your Email Address</h1>
                <p style="font-size: 16px; color: #5a6b7e; text-align: center; margin: 0 0 30px; line-height: 1.6;">
                    Thank you for choosing OneCasa Real Estate. To complete your registration, please use the One-Time Password (OTP) below.
                </p>
                
                <!-- OTP Box -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                    <tr>
                        <td style="text-align: center;">
                            <div style="background: #f4f7ff; border-radius: 12px; padding: 25px; display: inline-block; border: 1px dashed #2c5f7e;">
                                <p style="font-size: 16px; color: #5a6b7e; margin: 0 0 12px; font-weight: 500;">Your verification code:</p>
                                <div style="font-size: 42px; font-weight: 700; color: #2c5f7e; letter-spacing: 8px; padding: 5px 0; background: #ffffff; border-radius: 8px; display: inline-block; min-width: 280px;">
                                    ${otp}
                                </div>
                                <p style="font-size: 14px; color: #8a9bad; margin: 15px 0 0;">
                                    This code expires in <strong style="color: #e74c3c;">5 minutes</strong>
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>
                
                <!-- Instructions -->
                <p style="font-size: 15px; color: #5a6b7e; text-align: center; margin: 30px 0 20px; line-height: 1.6;">
                    For security reasons, please do not share this code with anyone. OneCasa representatives will never ask you for this code.
                </p>
                
                <!-- CTA Button -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                    <tr>
                        <td style="text-align: center;">
                            <a href="#" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2c5f7e 0%, #3a7ca5 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 50px; box-shadow: 0 4px 12px rgba(44, 95, 126, 0.25);">
                                Verify Email Address
                            </a>
                        </td>
                    </tr>
                </table>
                
                <!-- Support Note -->
                <p style="font-size: 14px; color: #8a9bad; text-align: center; margin: 30px 0 0;">
                    If you didn't request this code, please ignore this email or contact support if you have concerns.
                </p>
            </td>
        </tr>
        
        <!-- Footer Section -->
        <tr>
            <td style="padding: 36px 24px; text-align: center; background: linear-gradient(180deg, #1a3a4a 0%, #152a36 100%); color: #ffffff;">
                <p style="font-size: 14px; margin: 0 0 20px; color: #c3d4e6; line-height: 1.5;">
                    Need help? Contact our support team at <a href="mailto:support@onecasa.in" style="color: #7dd3fc; text-decoration: none; font-weight: 500;">support@onecasa.in</a>
                </p>
                <!-- Social links (text-only for reliability in all email clients) -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 20px;">
                    <tr>
                        <td style="padding: 4px 6px;">
                            <a href="https://www.facebook.com/onecasa.in" target="_blank" rel="noopener" style="display: inline-block; padding: 8px 14px; background: rgba(255,255,255,0.12); color: #ffffff; font-size: 12px; font-weight: 600; text-decoration: none; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2);">Facebook</a>
                        </td>
                        <td style="padding: 4px 6px;">
                            <a href="https://www.instagram.com/onecasa.in/" target="_blank" rel="noopener" style="display: inline-block; padding: 8px 14px; background: rgba(255,255,255,0.12); color: #ffffff; font-size: 12px; font-weight: 600; text-decoration: none; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2);">Instagram</a>
                        </td>
                        <td style="padding: 4px 6px;">
                            <a href="https://www.linkedin.com/company/onecasa" target="_blank" rel="noopener" style="display: inline-block; padding: 8px 14px; background: rgba(255,255,255,0.12); color: #ffffff; font-size: 12px; font-weight: 600; text-decoration: none; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2);">LinkedIn</a>
                        </td>
                        <td style="padding: 4px 6px;">
                            <a href="https://www.youtube.com/@onecasaofficial" target="_blank" rel="noopener" style="display: inline-block; padding: 8px 14px; background: rgba(255,255,255,0.12); color: #ffffff; font-size: 12px; font-weight: 600; text-decoration: none; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2);">YouTube</a>
                        </td>
                    </tr>
                </table>
                <p style="font-size: 13px; margin: 0 0 4px; color: #94a3b8; font-weight: 500;">
                    &copy; ${new Date().getFullYear()} OneCasa Real Estate. All rights reserved.
                </p>
                <p style="font-size: 12px; margin: 0; color: #64748b; letter-spacing: 0.5px;">
                    One Roof, Every Solution
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const USER_CONFIRMATION_TEMPLATE = `
<html>
  <body style="font-family: 'Poppins', sans-serif; font-size: 14px; color: #434343;">
    <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff;">
      <header>
        <img alt="DreamCasa Real Estate" src="https://onecasa.in/_next/image?url=%2Fimages%2Flogobw.png&w=2048&q=75" height="50px" width="50px" />
        <span style="float: right; color: #434343;">${'${currentDate}'}</span>
      </header>
      <main>
        <h1 style="font-size: 24px;">Property Posted Successfully!</h1>
        <p>Dear ${'${userName}'},</p>
        <p>Your property <strong>${'${propertyTitle}'}</strong> has been successfully posted on DreamCasa Real Estate.</p>
        <p>Thank you for choosing us to showcase your property.</p>
      </main>
      <footer>
        <p>Contact us at <a href="mailto:support@onecasa.in">support@onecasa.in</a></p>
      </footer>
    </div>
  </body>
</html>
`;
export const ADMIN_LEAD_NOTIFICATION_TEMPLATE = `
<html>
  <body style="font-family: 'Poppins', sans-serif; font-size: 14px; color: #333; margin: 0; padding: 0; background-color: #e9edf8;">
    <div style="max-width: 680px; margin: 40px auto; padding: 40px 30px; background-color: #ffffff; border-radius: 8px; background-color: #bfdbfe; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <img src="https://onecasa.in/_next/image?url=%2Fimages%2Flogobw.png&w=2048&q=75" alt="DreamCasa Real Estate" style="height: 50px; width: 50px;" />
        <span style="font-size: 14px; color: #666;">${'${currentDate}'}</span>
      </header>

      <!-- Main Content -->
      <main>
        <h2 style="font-size: 22px; color: #2c3e50; margin-bottom: 10px;">🎉 New Lead Notification</h2>
        <p style="margin: 10px 0;">You have received a new lead on DreamCasa.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">👤 Name:</td>
            <td style="padding: 8px 0;">${'${leadName}'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">🆔 Lead ID:</td>
            <td style="padding: 8px 0;">${'${leadId}'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">📞 Phone:</td>
            <td style="padding: 8px 0;">${'${phoneNumber}'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">📧 Email:</td>
            <td style="padding: 8px 0;">${'${email}'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">💼 Service Interested:</td>
            <td style="padding: 8px 0;">${'${service}'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">👨‍💼 Assigned To:</td>
            <td style="padding: 8px 0;">${'${assignedTo}'}</td>
          </tr>
        </table>

        <p style="margin-top: 20px;">Please log in to your admin dashboard to follow up with this lead.</p>
      </main>

      <!-- Footer -->
      <footer style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; font-size: 13px; color: #777;">
        <p>Need help? Contact us at <a href="mailto:dreamcasarealestates@gmail.in" style="color: #3b82f6;">support@onecasa.in</a></p>
        <p style="margin-top: 5px;">&copy; ${new Date().getFullYear()} DreamCasa Real Estate. All rights reserved.</p>
      </footer>
    </div>
  </body>
</html>

`;

export const ADMIN_NOTIFICATION_TEMPLATE = `
<html>
  <body style="font-family: 'Poppins', sans-serif; font-size: 14px; color: #434343;">
    <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff;">
      <header>
       <img alt="DreamCasa Real Estate" src="https://onecasa.in/_next/image?url=%2Fimages%2Flogobw.png&w=2048&q=75" height="50px" width="50px" />
        <span style="float: right; color: #434343;">${'${currentDate}'}</span>
      </header>
      <main>
        <h1 style="font-size: 24px;">New Property Posted</h1>
        <p>A new property titled <strong>${'${propertyTitle}'}</strong> has been posted by ${'${postedBy}'}</p>.
        <p>Property ID: ${'${propertyId}'}</p>
        <p>Please review the listing at your earliest convenience.</p>
      </main>
      <footer>
        <p>Contact us at <a href="mailto:support@onecasa.in">support@onecasa.in</a></p>
      </footer>
    </div>
  </body>
</html>

`;
export const ADMIN_REFERRAL_NOTIFICATION_TEMPLATE = `
<html>
  <body style="font-family: 'Poppins', sans-serif; font-size: 14px; color: #333; margin: 0; padding: 0; background-color: #e9edf8;">
    <div style="max-width: 680px; margin: 40px auto; padding: 40px 30px; background-color: #ffffff; border-radius: 8px; background-color: #f4f7ff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <img src="https://onecasa.in/_next/image?url=%2Fimages%2Flogobw.png&w=2048&q=75" alt="DreamCasa Real Estate" style="height: 50px; width: 50px;" />
        <span style="font-size: 14px; color: #666;">{{createdAt}}</span>
      </header>

      <!-- Main Content -->
      <main>
        <h2 style="font-size: 22px; color: #2c3e50; margin-bottom: 10px;">🤝 New Referral Received</h2>
        <p style="margin: 10px 0;">A new referral has been submitted by a user on DreamCasa.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">🙋 Referrer:</td>
            <td style="padding: 8px 0;">{{referrerName}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">👤 Friend Name:</td>
            <td style="padding: 8px 0;">{{friendName}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">📞 Friend Phone:</td>
            <td style="padding: 8px 0;">{{friendPhone}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">🏷️ Referral Code:</td>
            <td style="padding: 8px 0;">{{referralCode}}</td>
          </tr>
        </table>

        <p style="margin-top: 20px;">Please log in to your admin dashboard to follow up with this referral.</p>
      </main>

      <!-- Footer -->
      <footer style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; font-size: 13px; color: #777;">
        <p>Need help? Contact us at <a href="mailto:dreamcasarealestates@gmail.in" style="color: #3b82f6;">support@onecasa.in</a></p>
        <p style="margin-top: 5px;">&copy; ${new Date().getFullYear()} DreamCasa Real Estate. All rights reserved.</p>
      </footer>
    </div>
  </body>
</html>
`;

export const USER_NOTIFICATION_TEMPLATE = `
<html>
  <body style="font-family: 'Poppins', sans-serif; font-size: 14px; color: #434343;">
    <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff;">
      <header>
       <img alt="DreamCasa Real Estate" src="https://onecasa.in/_next/image?url=%2Fimages%2Flogobw.png&w=2048&q=75" height="50px" width="50px" />
        <span style="float: right; color: #434343;">${'${currentDate}'}</span>
      </header>
      <main>
        <h1 style="font-size: 24px;">Confirmation: Action Successful</h1>
        <p>Dear ${'${userName}'},</p>
        <p>Your action has been successfully completed on DreamCasa Real Estate.</p>
        <p>Thank you for choosing DreamCasa Real Estate!</p>
      </main>
      <footer>
        <p>Contact us at <a href="mailto:support@onecasa.in">support@onecasa.in</a></p>
      </footer>
    </div>
  </body>
</html>
`;
export const ADMIN_CONTACT_NOTIFICATION_TEMPLATE = `
<html>
  <body style="font-family: 'Poppins', sans-serif; font-size: 14px; color: #333; margin: 0; padding: 0; background-color: #f5f7fb;">
    <div style="max-width: 680px; margin: 40px auto; padding: 40px 30px; background-color: #ffffff; border-radius: 8px; background-color: #e0f2fe; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <img src="https://onecasa.in/_next/image?url=%2Fimages%2Flogobw.png&w=2048&q=75" alt="DreamCasa Real Estate" style="height: 50px; width: 50px;" />
        <span style="font-size: 14px; color: #666;">${'${currentDate}'}</span>
      </header>

      <!-- Main Content -->
      <main>
        <h2 style="font-size: 22px; color: #2c3e50; margin-bottom: 10px;">📩 New Contact Us Submission</h2>
        <p style="margin: 10px 0;">A new inquiry has been received from the Contact Us form.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">👤 Name:</td>
            <td style="padding: 8px 0;">${'${leadName}'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">🆔 Contact ID:</td>
            <td style="padding: 8px 0;">${'${leadId}'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">📞 Phone:</td>
            <td style="padding: 8px 0;">${'${phoneNumber}'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">📧 Email:</td>
            <td style="padding: 8px 0;">${'${email}'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">📝 Message:</td>
            <td style="padding: 8px 0;">${'${service}'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500; color: #555;">👨‍💼 Assigned To:</td>
            <td style="padding: 8px 0;">${'${assignedTo}'}</td>
          </tr>
        </table>

        <p style="margin-top: 20px;">Please log in to your admin dashboard to follow up with this inquiry.</p>
      </main>

      <!-- Footer -->
      <footer style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; font-size: 13px; color: #777;">
        <p>Need help? Contact us at <a href="mailto:dreamcasarealestates@gmail.in" style="color: #3b82f6;">support@onecasa.in</a></p>
        <p style="margin-top: 5px;">&copy; ${new Date().getFullYear()} DreamCasa Real Estate. All rights reserved.</p>
      </footer>
    </div>
  </body>
</html>
`;

export const generateDocumentUploadTemplate = (
  tabName: string,
  userName?: string,
) => {
  const formattedTab =
    tabName[0].toUpperCase() + tabName.slice(1).toLowerCase();
  const uploadTime = new Date().toLocaleString('default', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
  <html>
    <body style="font-family: 'Poppins', sans-serif; font-size: 14px; color: #434343;">
      <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff;">
        <header style="display: flex; justify-content: space-between; align-items: center;">
          <img alt="DreamCasa Real Estate" src="https://onecasa.in/_next/image?url=%2Fimages%2Flogobw.png&w=2048&q=75" height="50px" width="50px" />
        </header>
        <main>
          <h1 style="font-size: 24px;">Document Uploaded</h1>
          <p>Hello ${userName || 'User'},</p>
          <p>Your <strong>${formattedTab}</strong> document has been successfully uploaded on <strong>${uploadTime}</strong>.</p>
          <p>You can now view or download it anytime from your dashboard.</p>
        </main>
        <footer style="margin-top: 30px;">
          <p>If you have any questions, please contact us at <a href="mailto:support@onecasa.in">support@onecasa.in</a>.</p>
        </footer>
      </div>
    </body>
  </html>
  `;
};

export const generateDailyProgressTemplate = (data: CreateDailyProgressDto) => {
  return `
  <html>
  <body style="font-family: 'Poppins', sans-serif; font-size: 14px; color: #434343;">
    <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff;">
      <header style="display: flex; justify-content: space-between; align-items: center;">
        <img alt="DreamCasa Real Estate" src="https://onecasa.in/_next/image?url=%2Fimages%2Flogobw.png&w=2048&q=75" height="50px" width="50px" />
      </header>
      <main>
        <h1 style="font-size: 24px;">Daily Progress Update - Day ${data?.day} (${data?.date})</h1>
        <section style="margin-bottom: 20px;">
          <h2 style="font-size: 18px;">Description</h2>
          <p>${data?.description}</p>
        </section>
        <section style="margin-bottom: 20px;">
          <h2 style="font-size: 18px;">Status</h2>
          <p>${data?.status}</p>
        </section>
        <section style="margin-bottom: 20px;">
          <h2 style="font-size: 18px;">Work Type</h2>
          <p>${data?.workType}</p>
        </section>
        <section style="margin-bottom: 20px;">
          <h2 style="font-size: 18px;">Place Type</h2>
          <p>${data?.placeType}</p>
        </section>
        <section style="margin-bottom: 20px;">
          <h2 style="font-size: 18px;">Issues</h2>
          <p>${data?.issues}</p>
        </section>
        <section style="margin-bottom: 20px;">
          <h2 style="font-size: 18px;">Materials Used</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #e6e6e6;">
                <th style="border: 1px solid #ddd; padding: 8px;">Material</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${data?.materials
                .map(
                  (material) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${material?.material}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${material?.desc}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${material?.quantity}</td>
              </tr>
              `,
                )
                ?.join('')}
            </tbody>
          </table>
        </section>
        <section style="margin-bottom: 20px;">
          <h2 style="font-size: 18px;">Labor Count</h2>
          <p>${data?.laborCount}</p>
        </section>
        <section style="margin-bottom: 20px;">
          <h2 style="font-size: 18px;">Expenses Incurred</h2>
          <p>${data?.expensesIncurred ? data?.expensesIncurred : 'N/A'}</p>
        </section>
        <section style="margin-bottom: 20px;">
          <h2 style="font-size: 18px;">Customer Notes</h2>
          <p>${data?.customerNotes}</p>
        </section>
        <section style="margin-bottom: 20px;">
          <h2 style="font-size: 18px;">Images/Videos</h2>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
            ${data?.imageOrVideo?.map(
              (url) => `
            <div style="margin-bottom: 10px; width: 150px; height: 150px;">
              <img src="${url}" alt="Progress Image" style="max-width: 100%; height: auto;" />
            </div>
            `,
            )}
          </div>
        </section>
      </main>
     <footer>
        <p>If you have any questions, feel free to contact our support team at <a href="mailto:support@onecasa.in">support@onecasa.in</a></p>
      </footer>
    </div>
  </body>
</html>
  `;
};
export const generateReferralTemplate = (data: {
  friendName?: string;
  friendPhone?: string;
  createdAt: string;
  referrerName: string;
  referralCode: string;
}) => {
  return `
  <html>
    <body style="font-family: 'Poppins', sans-serif; font-size: 14px; color: #434343;">
      <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff;">
        <header style="display: flex; justify-content: space-between; align-items: center;">
          <img alt="DreamCasa" src="https://onecasa.in/_next/image?url=%2Fimages%2Flogobw.png&w=2048&q=75" height="50px" width="50px" />
        </header>

        <main>
          <h1 style="font-size: 24px;">Referral Submitted Successfully</h1>
          <p>Hello ${data.referrerName},</p>
          <p>Thank you for referring <strong>${data.friendName || 'your friend'}</strong> to OneCasa.</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tbody>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Friend Name:</td>
                <td style="padding: 8px;">${data.friendName || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Friend Phone:</td>
                <td style="padding: 8px;">${data.friendPhone || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Referral Date:</td>
                <td style="padding: 8px;">${data.createdAt}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Referral Code:</td>
                <td style="padding: 8px;">${data.referralCode}</td>
              </tr>
            </tbody>
          </table>

          <p style="margin-top: 20px;">You can track your referrals from your dashboard.</p>
        </main>

        <footer style="margin-top: 40px;">
          <p>If you have any questions, feel free to contact our team at <a href="mailto:support@onecasa.in">support@onecasa.in</a></p>
        </footer>
      </div>
    </body>
  </html>
  `;
};

export const generatePropertyUpdateTemplate = (
  user: { fullName: string },
  changes: string[],
) => {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; font-size: 14px; color: #333; background-color: #f4f4f4; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #2b2b2b;">Hello ${user.fullName},</h2>
        <p>Your property has been updated. Below are the changes:</p>
        <ul style="padding-left: 20px;">
          ${changes.map((change) => `<li>${change}</li>`).join('')}
        </ul>
        <p style="margin-top: 30px;">Thank you,<br />The OneCasa Team</p>
      </div>
    </body>
  </html>
  `;
};
export const generateProjectUpdateTemplate = (project: { name: string }) => {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; font-size: 14px; color: #333; background-color: #f4f4f4; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #2b2b2b;">Project Updated</h2>
        <p>The project <strong>${project.name}</strong> has been successfully updated.</p>
        <p style="margin-top: 30px;">Thank you,<br />The OneCasa Team</p>
      </div>
    </body>
  </html>
  `;
};

export const generateDailyProgressSummaryTemplate = (
  data: CreateDailyProgressDto[],
) => {
  return `
  <html>
  <body style="font-family: 'Poppins', sans-serif; font-size: 14px; color: #434343;">
    <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff;">
      <header style="display: flex; justify-content: space-between; align-items: center;">
       <img alt="DreamCasa Real Estate" src="https://onecasa.in/_next/image?url=%2Fimages%2Flogobw.png&w=2048&q=75" height="50px" width="50px" />
      </header>
      <main>
        <h1 style="font-size: 24px;">Week progress summary</h1>
        ${data
          .map(
            (progress) => `
          <section style="margin-bottom: 30px; padding: 15px; border: 1px solid #ccc; border-radius: 5px; background: #ffffff;">
            <h2 style="font-size: 18px; color: #2b2b2b;">Day ${progress.day} - ${progress.date}</h2>
            <p><strong>Status:</strong> ${progress.status}</p>
            <p><strong>Work Type:</strong> ${progress.workType}</p>
            <p><strong>Place Type:</strong> ${progress.placeType}</p>
            <p><strong>Description:</strong> ${progress.description}</p>
            <p><strong>Issues:</strong> ${progress.issues}</p>
            <p><strong>Labor Count:</strong> ${progress.laborCount}</p>
            <p><strong>Expenses Incurred:</strong> ${
              progress.expensesIncurred ? progress.expensesIncurred : 'N/A'
            }</p>
            <p><strong>Customer Notes:</strong> ${progress.customerNotes}</p>

            <section style="margin-top: 15px;">
              <h3 style="font-size: 16px;">Materials Used</h3>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                <thead>
                  <tr style="background-color: #e6e6e6;">
                    <th style="border: 1px solid #ddd; padding: 8px;">Material</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  ${progress.materials
                    .map(
                      (material) => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${material?.material}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${material?.desc}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${material?.quantity}</td>
                  </tr>
                  `,
                    )
                    .join('')}
                </tbody>
              </table>
            </section>

            <section style="margin-top: 15px;">
              <h3 style="font-size: 16px;">Images/Videos</h3>
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
                ${progress?.imageOrVideo?.map(
                  (url) => `
                  <div style="margin-bottom: 10px; width: 150px; height: 150px;">
                    <img src="${url}" alt="Progress Image" style="max-width: 100%; height: auto;" />
                  </div>
                  `,
                )}
              </div>
            </section>
          </section>
        `,
          )
          .join('')}
      </main>
      <footer>
        <p>If you have any questions, feel free to contact our support team at <a href="mailto:support@onecasa.in">support@onecasa.in</a></p>
      </footer>
    </div>
  </body>
</html>
  `;
};

//property-lead template for property owner

export const OWNER_LEAD_NOTIFICATION_TEMPLATE = `
<html>
  <body style="font-family: 'Poppins', sans-serif; font-size: 14px; color: #434343;">
    <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff;">
      <header>
        <img alt="DreamCasa Real Estate" src="https://onecasa.in/_next/image?url=%2Fimages%2Flogobw.png&w=2048&q=75" height="50px" width="50px" />
        <span style="float: right; color: #434343;">${'${currentDate}'}</span>
      </header>
      <main>
        <h1 style="font-size: 24px;">New Lead Received</h1>
        <p>Hello <strong>${'${ownerName}'}</strong>,</p>
        <p>You have received a new enquiry for your property titled <strong>${'${propertyTitle}'}</strong>.</p>
        
        <h2 style="font-size: 18px; margin-top: 20px;">Lead Details:</h2>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Name:</strong> ${'${leadName}'}</li>
          <li><strong>Email:</strong> ${'${leadEmail}'}</li>
          <li><strong>Phone:</strong> ${'${leadPhone}'}</li>
          <li><strong>Interested in Home Loan:</strong> ${'${interestedInLoan}'}</li>
        </ul>

        <p style="margin-top: 20px;">Please follow up promptly to maximize engagement.</p>
      </main>
      <footer style="margin-top: 30px;">
        <p>Need help? Contact us at <a href="mailto:support@onecasa.in">support@onecasa.in</a></p>
      </footer>
    </div>
  </body>
</html>
`;

export const CUSTOM_BUILDER_CREATION_TEMPLATE = `
<html>
  <body style="font-family: 'Poppins', sans-serif; font-size: 14px; color: #434343;">
    <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff;">
      <header style="display: flex; justify-content: space-between; align-items: center;">
        <img src="https://onecasa.in/_next/image?url=%2Fimages%2Flogobw.png&w=2048&q=75" alt="DreamCasa Real Estate" height="50" width="50" />
        <span style="color: #434343;">\${currentDate}</span>
      </header>
      <main>
        <h1 style="font-size: 24px; margin-top: 20px;">Custom Builder Tracking Activated</h1>
        <p>Hello <strong>\${userName}</strong>,</p>
        <p>We’re excited to let you know that your custom builder tracking has been successfully initiated with DreamCasa.</p>

        <h2 style="font-size: 18px; margin-top: 20px;">Project Overview:</h2>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Project Name:</strong> \${projectTitle}</li>
          <li><strong>Start Date:</strong> \${startDate}</li>
          <li><strong>Location:</strong> \${projectLocation}</li>
        </ul>

        <p style="margin-top: 20px;">
          You’ll start receiving regular WhatsApp and email updates on the progress of your project.
        </p>

        <p style="margin-top: 10px;">
          You can also track everything live on your dashboard.
        </p>
      </main>
      <footer style="margin-top: 30px;">
        <p>Need help? Reach us at <a href="mailto:support@onecasa.in">support@onecasa.in</a></p>
      </footer>
    </div>
  </body>
</html>
`;
