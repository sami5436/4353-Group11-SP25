import React, { useState } from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'

function ContactUs() {


  return (
    <>
      <div className="fixed top-0 left-0 z-[-1] h-full w-full rotate-180 bg-gradient-to-b from-emerald-600 to-emerald-900"></div>

      <div className="relative min-h-screen w-full text-white">
        <div className="relative z-10 flex flex-col items-center justify-start px-4 pt-50">
          <div className="max-w-3xl w-full text-6xl font-bold mb-5 text-center">
            Contact <span className="inline-block text-[#E8CDA2]">Us</span>
          </div>
          <div className="max-w-3xl w-full text-base text-center mx-auto mb-10">
            Have questions or want to get involved? We'd love to hear from you. 
            Reach out through the form below or use our contact information.
          </div>

          <div className="w-full mb-10 m-10 p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#F8F9FA] text-black p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-sm text-gray-600">
                  support@volunteerplatform.org
                </p>
              </div>

              <div className="bg-[#F8F9FA] text-black p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <Phone className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Phone</h3>
                <p className="text-sm text-gray-600">
                  (555) 123-4567
                </p>
              </div>

              <div className="bg-[#F8F9FA] text-black p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Address</h3>
                <p className="text-sm text-gray-600">
                  123 Volunteer Street, Impact City, IC 12345
                </p>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </>
  )
}

export default ContactUs