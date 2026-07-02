import requestHttp from "@/utils/request";

export default {
    async search(data,start, size, ) {
        return await requestHttp.post(`/rentalType/search/${start}/${size}`, data);
    },
    async add(data) {
        return await requestHttp.post('/rentalType/add', data)
    },
    async delete(id) {
        return await requestHttp.delete(`/rentalType/delete/${id}`)
    },
    async deleteBatch(ids) {
        return await requestHttp.delete('/rentalType/deleteBatch', { data: ids })
    },
    async update(data) {
        return await requestHttp.put('/rentalType/update', data)
    },

}