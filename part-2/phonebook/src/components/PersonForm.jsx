const PersonForm = ({ onSubmit, newName, onNameChange, newNumber, onNumberChange }) => {
    return (
        <form onSubmit={onSubmit}>
            <div>
                <label>name: </label>
                <input value={newName} onChange={onNameChange} />
            </div>
            <div>
                <label>number: </label>
                <input value={newNumber} onChange={onNumberChange} />
            </div>
            <div>
                <button type="submit">add</button>
            </div>
        </form>
    )
}

export default PersonForm
