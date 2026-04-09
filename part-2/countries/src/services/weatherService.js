import axios from 'axios'

const apiKey = import.meta.env.VITE_OPENWEATHER_KEY

const getWeather = (capital) => {
    if (!apiKey) {
        return Promise.resolve(null)
    }
    return axios
        .get(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${apiKey}&units=metric`)
        .then((response) => response.data)
        .catch(() => null)
}

export default { getWeather }
