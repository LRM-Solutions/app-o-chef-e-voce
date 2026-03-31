import api from "./apiConfig";

export const getBalance = async () => {
  const { data } = await api.get("/user/balance");
  return data;
};

export const getProfessionals = async () => {
  const { data } = await api.get("/professionals");
  return data;
};

export const getServices = async () => {
  const { data } = await api.get("/services");
  return data;
};

export const getAvailability = async ({ professionalId, date, serviceId }) => {
  const { data } = await api.get("/availability", {
    params: {
      professional_id: professionalId,
      date,
      service_id: serviceId,
    },
  });
  return data;
};

export const createAppointment = async ({
  professionalId,
  serviceId,
  scheduledAt,
}) => {
  const { data } = await api.post("/appointments", {
    professional_id: professionalId,
    service_id: serviceId,
    scheduled_at: scheduledAt,
  });
  return data;
};

export const getNextAppointment = async () => {
  const { data } = await api.get("/appointments/next");
  return data;
};

export const listMyAppointments = async () => {
  const { data } = await api.get("/appointments/me");
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get("/user/profile");
  return data;
};

export const updateProfile = async ({ userName }) => {
  const { data } = await api.put("/user/profile", {
    user_name: userName,
  });
  return data;
};

export const uploadAvatar = async (imageUri) => {
  const formData = new FormData();
  const filename = imageUri.split("/").pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  formData.append("image", {
    uri: imageUri,
    name: filename,
    type,
  });

  const { data } = await api.post("/user/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};
