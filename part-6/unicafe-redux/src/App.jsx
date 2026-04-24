const App = ({ state, dispatch }) => {
    return (
        <div>
            <h2>give feedback</h2>
            <button onClick={() => dispatch({ type: 'GOOD' })}>good</button>
            <button onClick={() => dispatch({ type: 'OK' })}>ok</button>
            <button onClick={() => dispatch({ type: 'BAD' })}>bad</button>
            <button onClick={() => dispatch({ type: 'ZERO' })}>reset stats</button>
            <h2>statistics</h2>
            <div>good {state.good}</div>
            <div>ok {state.ok}</div>
            <div>bad {state.bad}</div>
        </div>
    )
}

export default App