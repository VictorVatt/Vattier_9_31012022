/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import Router from "../app/Router.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills.js"

jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in the vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      Router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId("icon-mail"))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.classList.contains("active-icon")).toBe(true)
    })

    test("Then the NewBill form should be displayed", () => {
      document.body.innerHTML = NewBillUI()
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
      const submitBtn = document.getElementById('btn-send-bill')
      expect(submitBtn).toBeTruthy()
    })


    describe("When i submit the new bill", () => {

      // test pour la fonction handleSubmit
      test("Then the handleSubmit function should be called", () => {
        document.body.innerHTML = NewBillUI()
        
        Object.defineProperty(window, 'localStorage', { value: localStorageMock})
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        })) 
        const newBill = new NewBill({document, onNavigate})
        const handleSubmit = jest.fn(newBill.handleSubmit)
        const submitFormBtn = screen.getByTestId("form-new-bill")
        expect(submitFormBtn).toBeTruthy()
        submitFormBtn.addEventListener("click", handleSubmit)
        fireEvent.click(submitFormBtn)
        expect(handleSubmit).toHaveBeenCalled()
        
      })
    })

    describe("When i select a new file", () => {
      // test de la fonction handleChangeFile
      test("Then it should change the file uploaded and call the handleChangeFile", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock})
        window.localStorage.setItem('user', JSON.stringify({ type: "Employee"}))
        document.body.innerHTML = NewBillUI()

        const newBill = new NewBill({
          document,
          onNavigate: (pathname) => document.body.innerHTML = ROUTES({pathname}),
          localStorage: window.localStorage
        })
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        const changeFileBtn = screen.getByTestId("file")
        expect(changeFileBtn).toBeTruthy()
        changeFileBtn.addEventListener("change", handleChangeFile)
        fireEvent.change(changeFileBtn, {
          target: {
            files: [new File(["test.png"], "test.png", { type : "image/png" })]
          }
        })
        expect(handleChangeFile).toHaveBeenCalled()
        expect(changeFileBtn.files[0].name).toBe("test.png")

      })
    })
  })
})
