const CountryDetail = ({ country, weather }) => {
    return (
        <div>
            <h2>{country.name.common}</h2>
            <p>Capital: {country.capital ? country.capital[0] : 'N/A'}</p>
            <p>Area: {country.area} km²</p>

            <h3>Languages</h3>
            {country.languages ? (
                <ul>
                    {Object.values(country.languages).map((lang) => (
                        <li key={lang}>{lang}</li>
                    ))}
                </ul>
            ) : (
                <p>No languages found</p>
            )}

            <p style={{ fontSize: '60px', marginTop: '20px' }}>{country.flags ? country.flags.unicode : ''}</p>

            {weather && (
                <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                    <h3>Weather in {country.capital ? country.capital[0] : 'capital'}</h3>
                    <p>Temperature: {weather.main.temp}°C</p>
                    <p>Weather: {weather.weather[0].description}</p>
                    {weather.weather[0].icon && (
                        <img
                            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                            alt="weather icon"
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default CountryDetail
