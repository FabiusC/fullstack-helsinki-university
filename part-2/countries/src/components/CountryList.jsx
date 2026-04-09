const CountryList = ({ countries, onSelect }) => {
    return (
        <div>
            {countries.map((country) => (
                <p key={country.name.common}>
                    {country.name.common}{' '}
                    <button onClick={() => onSelect(country.name.common)}>show</button>
                </p>
            ))}
        </div>
    )
}

export default CountryList
