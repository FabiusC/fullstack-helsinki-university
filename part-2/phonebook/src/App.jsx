import { useEffect, useState } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'
import personService from './services/personService'

const App = () => {
    const [persons, setPersons] = useState([])
    const [newName, setNewName] = useState('')
    const [newNumber, setNewNumber] = useState('')
    const [filterText, setFilterText] = useState('')
    const [successMessage, setSuccessMessage] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)

    useEffect(() => {
        personService.getAll().then((data) => {
            setPersons(data)
        })
    }, [])

    const handleSubmit = (event) => {
        event.preventDefault()

        const existingPerson = persons.find((person) => person.name === newName)
        if (existingPerson) {
            const confirmReplace = window.confirm(
                `${newName} is already added to phonebook, replace the old number with a new one?`
            )
            if (confirmReplace) {
                const updatedPerson = { ...existingPerson, number: newNumber }
                personService
                    .update(existingPerson.id, updatedPerson)
                    .then((returnedPerson) => {
                        setPersons(
                            persons.map((p) => (p.id !== existingPerson.id ? p : returnedPerson))
                        )
                        setSuccessMessage(`Updated ${newName}'s number`)
                        setTimeout(() => setSuccessMessage(null), 3000)
                        setNewName('')
                        setNewNumber('')
                    })
                    .catch(() => {
                        setErrorMessage(`Information of ${newName} has already been removed from server`)
                        setTimeout(() => setErrorMessage(null), 5000)
                        setPersons(persons.filter((p) => p.id !== existingPerson.id))
                    })
            }
            return
        }

        const personObject = {
            name: newName,
            number: newNumber,
        }

        personService
            .create(personObject)
            .then((returnedPerson) => {
                setPersons(persons.concat(returnedPerson))
                setSuccessMessage(`Added ${newName}`)
                setTimeout(() => setSuccessMessage(null), 3000)
                setNewName('')
                setNewNumber('')
            })
            .catch(() => {
                setErrorMessage('Error adding person')
                setTimeout(() => setErrorMessage(null), 5000)
            })
    }

    const personsToShow = persons.filter((person) =>
        person.name.toLowerCase().includes(filterText.toLowerCase())
    )

    const handleDelete = (id, name) => {
        const confirmDelete = window.confirm(`Delete ${name} ?`)
        if (confirmDelete) {
            personService
                .deletePerson(id)
                .then(() => {
                    setPersons(persons.filter((p) => p.id !== id))
                    setSuccessMessage(`Deleted ${name}`)
                    setTimeout(() => setSuccessMessage(null), 3000)
                })
                .catch(() => {
                    setErrorMessage(`Information of ${name} has already been removed from server`)
                    setTimeout(() => setErrorMessage(null), 5000)
                    setPersons(persons.filter((p) => p.id !== id))
                })
        }
    }

    return (
        <div>
            <h2>Phonebook</h2>
            <Notification message={successMessage} type="success" />
            <Notification message={errorMessage} type="error" />

            <Filter value={filterText} onChange={(event) => setFilterText(event.target.value)} />

            <h3>Add a new</h3>

            <PersonForm
                onSubmit={handleSubmit}
                newName={newName}
                onNameChange={(event) => setNewName(event.target.value)}
                newNumber={newNumber}
                onNumberChange={(event) => setNewNumber(event.target.value)}
            />

            <h3>Numbers</h3>

            <Persons persons={personsToShow} onDelete={handleDelete} />
        </div>
    )
}

export default App
