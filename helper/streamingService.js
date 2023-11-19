import { toast } from "react-toastify"

export default async function performStreamedRequest(
  url,
  headers,
  body,
  setM,
  setSource,
  dismissToast = ""
) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    })
    if (response.status === 401) {
      throw new Error("Unauthorized")
    }
    if (response.status === 400) {
      const errorResponse = await response.json()
      const { errorCode, errorMessage } = errorResponse

      throw new Error(errorMessage || "Bad Request")
    }
    toast.dismiss(dismissToast)

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let chunk = ""
    let contents = ""

    let isConversationFinished = false // Flag variable
    let shouldStoreNextDataObject = false // Flag to indicate whether to store the next data object

    reader.read().then(function processResult(result) {
      chunk += decoder.decode(result.value, { stream: true })

      // Split chunk into individual data objects
      const dataObjects = chunk.split("\n").filter(Boolean)

      // Reset contents before processing new data objects
      contents = ""

      // Process each data object
      dataObjects.forEach((dataObject, index) => {
        if (shouldStoreNextDataObject) {
          // Store the next data object
          // Modify this code to handle the storage as per your requirements
          const data = dataObject.replace(/^data: /, "")

          let sourceData = JSON.parse(data)
          setSource(sourceData.context)
          shouldStoreNextDataObject = false // Reset the flag
        }
        // Process each data object except for the last one if it's incomplete
        if (!(index === dataObjects.length - 1 && !result.done)) {
          const data = dataObject.replace(/^data: /, "")

          if (data === "[DONE]") {
            isConversationFinished = true // Set the flag to true

            reader.cancel()
            toast.dismiss(dismissToast)
          } else if (data === "[CONTEXT]") {
            try {
              if (setSource) {
                shouldStoreNextDataObject = true
              }
              // Conditionally store the context data based on specific cases
            } catch (error) {
              console.error("Invalid JSON:", error)
            }
          } else {
            try {
              const jsonData = JSON.parse(data)
              if (jsonData.choices) {
                // Get content of Dave's response
                let daveResponse = jsonData.choices[0].delta.content

                // Append Dave's response to contents if it exists
                if (daveResponse) {
                  contents += daveResponse
                }
              }
            } catch (error) {
              console.error("Invalid JSON:", error)
            }
          }
        }
      })

      // Set the updated contents
      setM(contents)

      // Continue streaming responses
      if (!isConversationFinished) {
        reader.read().then(processResult)
      }
    })
  } catch (error) {
    toast.dismiss(dismissToast)

    if (error.message === "Unauthorized") {
      localStorage.clear()

      setTimeout(() => {
        window.location.assign("/")
      }, 2000)
    } else {
    }
  }
}
