const z = require('zod') //para hacer validaciones

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: "Movie title must be a string",
        required_error: "Movie title is required"
    }),
    year: z.number().int().positive().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(0),
    poster: z.string().url({msg: 'Poster must be a valud URL'}),
    genre: z.enum(['Action', 'Adventure', 'Comedy', 'Crime', "Drama"], 
    {
        required_error: "Movie genre is requred",
        invalid_type_error: "Movie genre must be an array"    
    }).array(),

})

function validateMovie (input){
    return movieSchema.safeParse(input)
}

//modificar valor de pelicula
function validatePartialMovie(input){
    //El metodo partial hace las propiedades de titulo, duration, etc opcionales, de forma que, si no esta, no hay problama, pero si sí esta, lo valida como siempre
    return movieSchema.partial().safeParse(input)
}

module.exports = {
    validateMovie,
    validatePartialMovie
}