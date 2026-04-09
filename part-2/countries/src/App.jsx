import { useEffect, useState } from 'react'
import CountryList from './components/CountryList'
import CountryDetail from './components/CountryDetail'
import countryService from './services/countryService'
import weatherService from './services/weatherService'

const App = () => {
  const [allCountries, setAllCountries] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    countryService.getAll().then((data) => {
      setAllCountries(data)
    })
  }, [])

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    setSelectedCountry(null)
    setWeather(null)
  }

  const handleSelectCountry = (countryName) => {
    countryService
      .getByName(countryName)
      .then((data) => {
        const country = Array.isArray(data) ? data[0] : data
        setSelectedCountry(country)

        if (country.capital && country.capital[0]) {
          weatherService.getWeather(country.capital[0]).then((weatherData) => {
            setWeather(weatherData)
          })
        }
      })
      .catch(() => {})
  }

  const filteredCountries = allCountries.filter((country) =>
    country.name.common.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Country Search</h1>
      <div>
        <label>find countries: </label>
        <input value={search} onChange={handleSearchChange} />
      </div>

      {allCountries.length === 0 && <p>Loading...</p>}

      {selectedCountry && (
        <div>
          <button onClick={() => setSelectedCountry(null)}>back</button>
          <CountryDetail country={selectedCountry} weather={weather} />
        </div>
      )}

      {!selectedCountry && search && filteredCountries.length > 10 && (
        <p>Too many matches, specify another filter</p>
      )}

      {!selectedCountry && search && filteredCountries.length > 1 && filteredCountries.length <= 10 && (
        <CountryList countries={filteredCountries} onSelect={handleSelectCountry} />
      )}

      {!selectedCountry && search && filteredCountries.length === 1 && (
        <CountryDetail country={filteredCountries[0]} weather={weather} />
      )}

      {!selectedCountry && search && filteredCountries.length === 0 && <p>No countries found</p>}
    </div>
  )
}

export default App
