import React, { useState } from 'react';

import './App.css'
import spinner from './spinner.gif'

function Start() {

  const options = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100]

  const [postnummer, setPostnummer] = useState("")
  const [gamemode, setGamemode] = useState("")
  const [questionAmount, setQuestionAmount] = useState(options[0].toString())
  const [fetching, setFetching] = useState(false)
  const [data, setData] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answerForm, setAnswerForm] = useState("")
  const [answers, setAnswers] = useState([])
  const [rand, setRand] = useState(0)

  const gameStates = ["pregame", "game", "postgame"]

  const [gameState, setGameState] = useState(gameStates[0])

  const onClick = (e) => {
    e.preventDefault()
    console.log("ok")
    console.log(gamemode)
    console.log(questionAmount)
    
    setFetching(true)

    fetch(`/api/get?postnummer=${postnummer}&amount=${questionAmount}`, {
      method: "GET"
    })
    .then(res => res.json())
    .then(json => {
        console.log(json)
        setFetching(false)
        setData(json)
        setGameState(gameStates[1])
      }
    )
  }

  const questionArea = () => {
    if (gamemode === "mixed") {
      return (
        <div>
          {rand <= 0.5 ?
            data[currentQuestion].name
          :
            data[currentQuestion].address
          }
        </div>
      )
    } else if (gamemode === "name") {
      return (
        <div>
          {data[currentQuestion].address}
        </div>
      )
    } else if (gamemode === "address")  {
      return (
        <div>
          {data[currentQuestion].name}
        </div>
      )
    }
  }

  const nextQuestion = (e) => {
    e.preventDefault()
    setAnswers(answers.concat(answerForm))
    setAnswerForm("")
    setRand(Math.random())
    if (currentQuestion < data.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setGameState(gameStates[2])
    }
  }

  const reset = () => {

    setGameState(gameStates[0])
    setPostnummer("")
    setGamemode("")
    setQuestionAmount(options[0].toString())
    setData([])
    setCurrentQuestion(0)
    setAnswers([])
  }

  const validData = postnummer.length === 5 && postnummer.match(/[0123456789]{5}/) && gamemode !== ""

  if (gameState === gameStates[0]) {
    return (
      <div>
        <h1>Posttraumatiskt</h1>
        <form>
          <input
            type="text"
            placeholder="Postnummer"
            maxLength={5}
            autoFocus
            autoComplete="off"
            onChange={(e) => setPostnummer(e.target.value.replace(" ", ""))}
            value={postnummer}
            disabled={fetching}
          />
          <span><input type="radio" name="gamemode" value="mixed" onChange={e => setGamemode(e.target.value)}/>Blandat</span>
          <span><input type="radio" name="gamemode" value="name" onChange={e => setGamemode(e.target.value)}/>Gissa namn</span>
          <span><input type="radio" name="gamemode" value="address" onChange={e => setGamemode(e.target.value)}/>Gissa adress</span>
          <span>
            <select onChange={(e) => setQuestionAmount(e.target.value)}>
              {options.map(x => <option value={x} key={x}>{x}</option>)}
            </select>
          </span>
          <button onClick={(e) => onClick(e)} disabled={!validData || fetching}>Starta</button>
          <img src={spinner} hidden={!fetching}/>
        </form>
      </div>
    );
  } else if (gameState === gameStates[1]) {
    return (
      <div>
        <h1>Posttraumatiskt</h1>
        {currentQuestion+1}/{data.length}
        {questionArea()}
        <form>
          <input autoFocus type="text" onChange={(e) => {setAnswerForm(e.target.value)}} value={answerForm} />
          <button onClick={(e) => nextQuestion(e)} disabled={answerForm.length === 0}>{currentQuestion === data.length - 1 ? "Finish" : "Next"}</button>
        </form>
      </div>
    )
  } else if (gameState === gameStates[2]) {
    return (
      <div>
        <table>
          <tr>
            <th>Namn</th>
            <th>Adress</th>
            <th>Du svarade</th>
          </tr>
          {data.map((x,i) => <tr><td>{x.name}</td><td>{x.address}</td><td>{answers[i]}</td></tr>)}
        </table>
        <button onClick={() => reset()} autoFocus>Try again</button>
      </div>
    )
  }

}

export default Start;
