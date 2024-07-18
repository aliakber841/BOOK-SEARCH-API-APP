import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
const app=express();

const port=3000;


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.render("index.ejs",{
        books: [],
        errorMessage:''
    })
})

app.get("/about",(req,res)=>{
    res.render("about.ejs")
})

app.get("/contact",(req,res)=>{
    res.render("contact.ejs")
})



app.post("/",async(req,res)=>{
    let books=[];
    let errorMessage = "No results matches your search";
    try{
        const search=req.body["search"];
        const response= await axios.get(`https://openlibrary.org/search.json?title=${search}`);
        const result=response.data;
        const {docs} = result;
       docs.map(book => {
            const { key, author_name, cover_i, edition_count, first_publish_year, title } = book;
            books.push({
                id: key,
                author: author_name,
                cover_id: cover_i,
                edition_count: edition_count,
                first_publish_year: first_publish_year,
                title: title
            });
        });
        res.render("index.ejs", {
            books: books,
            errorMessage:errorMessage
        });
        console.log(books);
        }
    catch(error){
        res.status(500);
    }
})

app.get('/bookdetail', async (req, res) => {
    const bookId = req.query.id;
    console.log('Book ID:', bookId); 
    if (!bookId) {
        return res.status(400).send('Book ID is required');
    }
    try {
        const response = await axios.get(`https://openlibrary.org/${bookId}.json`);
        const book = response.data;
        const bookDetails = {
            description: book.description ? book.description.value : 'No description found',
            title: book.title,
            cover_img: book.covers ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg` : 'images/no-image.png',
            subject_places: book.subject_places ? book.subject_places.join(', ') : 'No subject places found',
            subject_times: book.subject_times ? book.subject_times.join(', ') : 'No subject times found',
            subjects: book.subjects ? book.subjects.join(', ') : 'No subjects found',
            people: book.subject_people ? book.subject_people.join(',') :"No people found",
            url: book.links ? book.links[0].url : "No url found",
            excerpt: book.excerpts ? book.excerpts[0].excerpt : "No excerpt found",
            last_modified:book.last_modified ? book.last_modified.value : "Not found"
        };
        res.render('book-details.ejs', {
            bookDetails: bookDetails, 
        });
        console.log('Book ID:', bookDetails);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
        
        
   
   


app.listen(port,()=>{
    console.log(`Listening on Port ${port}`)
})