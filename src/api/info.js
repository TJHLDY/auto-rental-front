import requestHttp from "@/utils/request";

export default {
  async add(data) {
    return await requestHttp.post("/info/add", data);
  },
  async delete(id) {
    return await requestHttp.delete(`/info/delete/${id}`);
  },
  async deleteBatch(ids) {
    return await requestHttp.delete("/info/deleteBatch", ids);
  },
  async update(data) {
    return await requestHttp.put("/info/update", data);
  },
  async search(start,size,data) {
    return await requestHttp.post(`/info/search/${start}/${size}`, data);
  }
}