const express = require('express')
const cors = require('cors')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const app = express()
//Metodos normales: GET/HEAD/POST
//Metodos complejos: PUT/PATCH/DELETE

//Los metodos complejos, necesitan de CORS PRE-flight, y una peticion especial que se llama OPTIONS


//filtrar peliculas por genero
app.use(express.json())//middleware para poder acceder a el req.body
app.use(cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:8080',
        'http://localhost:1234',
        'https://movies.com',
        'https://midu.dev',
        'http://127.0.0.1:5500'

      ]
  
      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }
  
      if (!origin) {
        return callback(null, true)
      }
  
      return callback(new Error('Not allowed by CORS'))
    }
  }))
app.disable('x-powered-by')

app.get('/movies', (req, res) =>{

    const {genre} = req.query
    if(genre){
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() == genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

//buscar pelicula por id
//:id, son los parametros de la url
app.get('/movies/:id', (req, res) =>{
    const { id } = req.params
    const movie = movies.find(peli => peli.id == id)
    if(movie) return res.json(movie)

    res.status(404).json({msg: "Movie not found"})
})

app.post('/movies', (req, res) =>{
    const result = validateMovie(req.body);
    if(result.error){
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }

    const newMovie = {
        //UUID: identificador unico universal. lo que hace es crear un id unico
        id: crypto.randomUUID(),
        ... result.data
    }
    //No es rest, ya que guardamos el estado de la app en memoria
    movies.push(newMovie)
    res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
  
    if (movieIndex === -1) {
      return res.status(404).json({ message: 'Movie not found' })
    }
  
    movies.splice(movieIndex, 1)
  
    return res.json({ message: 'Movie deleted' })
  })

app.patch('/movies/:id', (req, res) =>{
    const {id} = req.params
    const result = validatePartialMovie(req.body)
    const movieIndex = movies.findIndex(movie => movie.id == id)

    if(movieIndex == -1){
        return res.status(404).json({msg: "Movie not found"})
    }

    const updateMovie = {
        ... movies[movieIndex],
        ... result.data
    }
    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})


const PORT = process.env.PORT ?? 1234

app.listen(PORT, () =>{
    console.log(`server listening on port ${PORT}`);
})