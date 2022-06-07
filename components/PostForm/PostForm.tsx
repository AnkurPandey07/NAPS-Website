import styles from "./PostForm.module.css"
import { useState, useRef } from "react"
import Image from "next/image";
import { Editor } from "@tinymce/tinymce-react";
import Loader from "../Loader/Loader";
import {useRouter} from 'next/router'
import MODAL from "../../components/Modal/Modal";

const categories = ["Editorial", "Media Report"]
const tagsoptions = ["sdjhks", "sksjdfh dsdfd","jkdhkjahfjkd", "jkdhfd", "jshdkjfsd dsdf", "hgdkjhdj"]
export default function PostForm({data}){
  // state variables
  const [isLoading, setLoading] = useState(false)
  const [isModal, setModal] = useState("false")
  const [modalMessage, setModalMessage] = useState("");
  const router = useRouter()
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState([]);
  const [thumbnail, setThumbnail] = useState("");
  const contentref = useRef(null);
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  //  Change functions
  const changeTitle = (e)=>{
    setTitle(e.target.value);
  }
  const changeAuthor = (e)=>{
    setAuthor(e.target.value);
    // console.log(e.target.value)
  }
  const changeCategory = (e)=>{
    setCategory(e.target.value);
  }
  const changeTags = (e)=>{
    setTags(prevTags=> [...prevTags,(!(prevTags.includes(e.target.value))&&e.target.value)])
  }
  const handleUnTag = (e)=>{
    setTags(prevtags=>prevtags.filter(tag=>(tag!=e.target.innerText)));
  }
  const changeSummary = (e)=>{
    setSummary(e.target.value);
  }
  //  Upload image 
  async function uploadImage(e){
    setThumbnail("Loading")
    const file = e.target.files[0];
    const fd =  new FormData();
    fd.append('images',file)
    // upload to api
    const res = await fetch(`${process.env.NEXT_PUBLIC_APIBASE}/image-upload`,{
      method: "POST",
      body: fd
    })
    const Data = await res.json();
    setThumbnail(Data.data.URL)
  }
  //  Submit Handler
    const showModal = (message,heading="Error")=>{
      setLoading(false)
      setModal(heading);
      setModalMessage(message);
    }
  const handleSubmit = async(e)=>{
    e.preventDefault();
    setLoading(true)
    // Invalid Data Handling -
    if(title==""){
      showModal("Check The Title")
      return;
    }
    if(thumbnail==""){
      showModal("Thumbnail not uploaded")
      return;
    }
    if(thumbnail=="Loading"){
      showModal("Thumbnail is being uploaded","Please Wait")
      return;
    }
    if(author==""){
      showModal("Check The Author")
      return;
    }
    if(category==""){
      showModal("Category not submitted")
      return;
    }
    if(tags.length<1){
      showModal("Check The Tags")
      return;
    }
    if(!contentref.current ||(contentref.current?.getContent()=="")){
      showModal("Check The Content")
      return;
    }
    if(summary==""){
      showModal("Summary not submitted")
      return;
    }
    // handling
    const dataToSubmit = {
      title: title,
      author: author,
      tags: tags,
      thumbnail: thumbnail,
      content: contentref.current.getContent(),
      category: category,
      summary: summary
    }
    const reqheaders = new Headers()
    reqheaders.append('Content-Type', "application/json")
    const res = await fetch(`${process.env.NEXT_PUBLIC_APIBASE}/blog`,{
      method: "POST",
      body: JSON.stringify(dataToSubmit),
      headers: reqheaders,
      mode: 'cors'
    })
    const data = await res.json();
    if(data._id){
      router.push(`/blog/${data._id}`)
    }
    setLoading(false)
    // console.log(data)
  }
  async function handleContentImageUpload(blobInfo, success, failure, progress) {
    try{
      const fd =  new FormData();
      fd.append('images',blobInfo.blob())
      // upload to api
      const res = await fetch(`${process.env.NEXT_PUBLIC_APIBASE}/image-upload`,{
        method: "POST",
        body: fd
      })
      // console.log(res.body)
      const Data = await res.json();
      success(Data.data.URL)
    }catch(err){
      // console.log(err);
      failure(err);
    }

  }
  return (
    <div className={styles.PostForm}>
    {isModal!="false"&&(<MODAL heading={isModal} message={modalMessage} changeState={()=>{setModal("false")}} />)}
    <div className={styles.form}>
    <label htmlFor="title">Title</label>
    <input required type="text" name="title" onChange={changeTitle} placeholder="Title" value={title}/>
    <div className={styles.imageContainer}>
      <Image src={(thumbnail==""||thumbnail=="Loading")?"/default.png":thumbnail} layout="fill" alt="Thumbnail"/>
    </div>
    <div className={styles.loadingContainer}>
      {thumbnail=="Loading"&&(<><Loader/> Please Wait</>)}
    </div>
    <label htmlFor="images">Thumbnail: </label>
    <input required type="file" name="images" onChange={uploadImage}></input>
    <br/>
    <label>Author</label>
    <select value={author} onChange={changeAuthor}>
      <option></option>
      {data&&data.map((curauthor)=>{
        return (
        <option key={curauthor._id} value={curauthor._id}>
          {curauthor.name} ({curauthor.rollNum})
          </option>
          )
      })}
    </select>
    <label>Category</label>
    <select required value={category} onChange={changeCategory}>
      <option></option>
      {categories.map(cat=><option key={cat}>{cat}</option>)}
    </select>
    <div className={styles.tagContainer}>
    {tags.map(tag=><div className={styles.tag} onClick={handleUnTag} key={tag}>{tag}</div>)}
    </div>
    <label>Tags</label>
    <select required onChange={changeTags}>
      <option></option>
      {tagsoptions.filter((tag)=>!tags.includes(tag)).map(cat=><option key={cat}>{cat}</option>)}
    </select>
    <label>Content</label>
      <Editor
      apiKey={process.env.NEXT_PUBLIC_TINYMCEKEY}
      id="content"
      onInit={(evt,editor) => contentref.current = editor}
      init={{
        height: 500,
        force_br_newlines: true,
        force_p_newlines: true,
        menubar: false,
        plugins: [
          "advlist autolink lists link image charmap print preview anchor",
          "searchreplace code visualblocks code",
          "insertdatetime media table paste code help wordcount",
        ],
        toolbar:
              "undo redo | formatselect | " +
              "bold italic backcolor image| alignleft aligncenter " +
              "alignright alignjustify | bullist numlist outdent indent | " +
              "removeformat | help",
        content_style:
          "body { font-family:Poppins,Helvetica,Arial,sans-serif; font-size:14px }",
        image_advtab: true,
        automatic_uploads: true,
        file_picker_types: "image",
        images_upload_handler: handleContentImageUpload,
        images_upload_base_path: "/",
      }}
      />
    <label>Summary</label>
      <textarea required value={summary} onChange={changeSummary}/>
      <div className={styles.loaderContainer}>
      <button className={styles.submitButton} onClick={handleSubmit}>Submit</button>
        {isLoading&&(<><Loader/> Please Wait</>)}
      </div>
    </div>
    </div>
  )
}
