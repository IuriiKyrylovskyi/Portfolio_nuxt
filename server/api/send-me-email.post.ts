import sendBookingEmail, { ISendMailResponse } from '~/service/sendMail';

export default defineEventHandler(async (event) => {
  const requestData = await readBody(event);

  const response = (await sendBookingEmail(requestData)) as ISendMailResponse;

  if (response.code !== 200) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Error occured',
    });
  }

  return Response.json({ message: response.message });
});
