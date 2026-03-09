{/* <TableContainer component={Paper} className=" w-full">

                    <Table>

                      <TableHead>

                        <TableRow className="md:text-[18px] text-[12px]">

                          <TableCell className="bg-gray-200 text-gray-600 font-bold md:py-3 py-1 px-3 text-center md:text-[18px] text-[12px] border  border-gray-300">

                            <input

                              type="checkbox"

                              checked={selectedLeads.length === allLeads.length}

                              onChange={() =>

                                setSelectedLeads(

                                  selectedLeads.length === allLeads.length

                                    ? []

                                    : allLeads.map((lead) => lead.id)

                                )

                              }

                            />

                          </TableCell>

                          {TableHeader.map((header) => (

                            <TableCell

                              key={header.key}

                              className="bg-gray-200 uppercase border  border-gray-300 text-black text-nowrap md:py-3 py-1 md:px-7  px-3 font-bold text-center md:text-[14px] text-[12px]"

                            >

                              {header.label}

                            </TableCell>

                          ))}

                          <TableCell className="bg-gray-200 uppercase text-gray-600 font-bold md:py-3 py-1 px-4 text-center md:text-[14px] text-[12px] border  border-gray-300">

                            Actions

                          </TableCell>

                        </TableRow>

                      </TableHead>

                      <TableBody>

                        {paginatedData.map((leads) => {

                          const uniqueKey = `${leads.id}-${leads.Phonenumber}`;

                          const assignedUser = leads.assignedTo;



                          return (

                            <TableRow

                              key={uniqueKey}

                              className="hover:bg-gray-100 border  border-gray-300"

                            >

                              <TableCell className="font-medium text-gray-600 md:text-[16px] text-[10px] text-start md:px-4 px-2 md:py-2 py-1 border  border-gray-300">

                                <input

                                  type="checkbox"

                                  checked={selectedLeads.includes(leads.id)}

                                  onChange={() => handleselectedLead(leads.id)}

                                />

                              </TableCell>

                              <TableCell className="capitalize text-nowrap font-medium text-gray-600 border  border-gray-300 md:text-[12px] text-[10px] text-center md:px-4 px-3 md:py-1 py-1">

                                {leads?.Fullname}

                              </TableCell>

                              <TableCell

                                className="capitalize text-nowrap font-medium text-gray-600 md:text-[12px] border  border-gray-300 text-[10px] text-center md:px-4

                              px-3 md:py-1 py-1"

                              >

                                <a

                                  href={`tel:${leads.Phonenumber}`}

                                  className="hover:underline text-[#3586FF] "

                                >

                                  {leads.Phonenumber}

                                </a>

                              </TableCell>



                              <TableCell className=" text-nowrap font-medium text-gray-600 md:text-[12px] text-[10px] border  border-gray-300 text-center md:px-4 px-3 md:py-1 py-1">

                                {leads.email}

                              </TableCell>

                              <TableCell

                                className={`capitalize md:py-1 py-2 md:px-4 px-2 text-center text-nowrap border  border-gray-300

   

     md:text-[12px] text-[10px] font-medium outline-none`}

                              >

                                <div

                                  className={` md:rounded-md w-auto rounded-[4px] text-center px-1.5 py-1.5 flex items-center justify-center gap-1  ${

                                    leads.propertytype === "Flat"

                                      ? "text-orange-800 bg-orange-100"

                                      : leads.propertytype === "Villa"

                                      ? "bg-indigo-200 text-indigo-700"

                                      : leads.propertytype ===

                                        "Independent House"

                                      ? "text-green-700 bg-green-100"

                                      : leads.propertytype ===

                                        "Independent Floor"

                                      ? "text-purple-700 bg-purple-100"

                                      : "text-gray-700 bg-gray-100"

                                  }`}

                                >

                                  {propertyTypeIcons[leads.propertytype]}



                                  {leads.propertytype}

                                </div>

                              </TableCell>



                              <TableCell

                                className="capitalize border  border-gray-300 text-nowrap font-medium text-gray-600 md:text-[12px] text-[10px] text-center md:px-4 px-3

                               md:py-1 py-1"

                              >

                                {leads.bhk}

                              </TableCell>

                              <TableCell

                                className="capitalize border  border-gray-300 text-nowrap font-medium text-gray-600 md:text-[12px] text-[10px] text-center md:px-4 px-3

                              md:py-1 py-1"

                              >

                                {leads.city}

                              </TableCell>

                              <TableCell

                                className="capitalize border  border-gray-300 text-nowrap font-medium text-gray-600 md:text-[12px] text-[10px] text-center md:px-4 px-3

                               md:py-1 py-1"

                              >

                                {leads.state || "Andhra Pradesh"}

                              </TableCell>

                              <TableCell

                                className="capitalize border  border-gray-300 text-nowrap font-medium text-gray-600 md:text-[12px] text-[10px] text-center md:px-4 px-3

                              md:py-1 py-1"

                              >

                                {new Date(leads.createdAt).toDateString()}

                              </TableCell>

                              <TableCell

                                className="capitalize border  border-gray-300 text-nowrap font-medium text-gray-600 md:text-[12px] text-[10px] text-center md:px-4 px-3

                              md:py-1 py-1"

                              >

                                {leads.phase}

                              </TableCell>

                              <TableCell

                                className="capitalize border  border-gray-300 text-nowrap font-medium text-gray-600 md:text-[12px] text-[10px] text-center md:px-4 px-3

                              md:py-1 py-1"

                              >

                                {leads.platform}

                              </TableCell>

                              <TableCell className="capitalize text-nowrap border  border-gray-300 font-medium text-center md:px-4 px-3 md:py-1 py-1 text-[10px] md:text-[12px] ">

                                <div

                                  className={`md:rounded-md w-auto rounded-[4px] text-center px-1.5 py-1.5 flex items-center justify-center gap-1 ${

                                    roleColors[leads.serviceType] ||

                                    "text-gray-700"

                                  }`}

                                >

                                  {roleIcons[leads.serviceType]}



                                  {leads.serviceType}

                                </div>

                              </TableCell>

                              <TableCell className="capitalize border  border-gray-300 text-nowrap font-medium text-gray-600 md:text-[12px] text-[10px] text-center max-w-[300px] overflow-x-auto md:px-4 px-3 md:py-1 py-1">

                                {leads.review}

                              </TableCell>

                              <TableCell

                                className="capitalize border  border-gray-300 text-nowrap font-medium text-gray-600 md:text-[12px] text-[10px] text-center md:px-4 px-3

                              md:py-1 py-1"

                              >

                                <select

                                  value={leads.leadstatus}

                                  onChange={(e) =>

                                    handleStatusSelect(e.target.value, leads.id)

                                  }

                                  className={`px-3 py-2 md:rounded-md rounded-[4px] md:text-[14px] text-[10px] font-medium outline-none cursor-pointer ${

                                    leads.leadstatus === "New"

                                      ? "bg-blue-200 text-blue-800"

                                      : leads.leadstatus === "Contacted"

                                      ? "bg-purple-100 text-purple-800"

                                      : leads.leadstatus === "Follow-up"

                                      ? "bg-yellow-100 text-yellow-800"

                                      : leads.leadstatus === "Interested"

                                      ? "bg-green-100 text-green-800"

                                      : leads.leadstatus === "Not Interested"

                                      ? "bg-red-100 text-red-800"

                                      : leads.leadstatus === "Closed"

                                      ? "bg-gray-500 text-white"

                                      : lead.leadstatus === "Site Visit"

    ? "bg-orange-200 text-orange-800"

                                      : "bg-blue-200 text-blue-800"

                                  }`}

                                >

                                  {status_options.map((status) => (

                                    <option

                                      key={status}

                                      value={status}

                                      className="text-black flex flex-col gap-3 space-y-4 bg-white"

                                    >

                                      {status}

                                    </option>

                                  ))}

                                </select>

                              </TableCell>

                              <TableCell className="capitalize border  border-gray-300 text-nowrap font-medium text-gray-600 md:text-[12px] text-[10px] text-center  md:px-4 px-3 md:py-1 py-1">

                                {leads?.assignedBy ? leads.assignedBy : "N/A"}

                              </TableCell>

                              <TableCell className="capitalize border  border-gray-300 text-nowrap font-medium text-gray-600  md:text-[12px] text-[10px] text-center md:px-4 px-3 md:py-1 py-1">

                                <SingleSelect

                                  type="single-select"

                                  name="assignedUser"

                                  options={roleUsers.map((user) => ({

                                    name: user.name,

                                    id: user.id,

                                  }))}

                                  rootCls="border-b-[1px] md:h-[40px] h-[35px] bg-blue-50  px-1 py-0.5 w-full border border-[#CFCFCF] md:rounded-[8px] font-medium text-[14px] rounded-[4px]"

                                  buttonCls="border-none "

                                  selectedOption={{

                                    name: assignedUser || "Not Available",

                                  }}

                                  optionsInterface={{

                                    isObj: true,

                                    displayKey: "name",

                                  }}

                                  handleChange={(name, value) =>

                                    handleAssignUser(leads.id, value.id)

                                  }

                                />

                              </TableCell>



                              <TableCell

                                className="capitalize border  border-gray-300 text-nowrap font-medium text-gray-600 md:text-[14px] text-[10px] text-center md:px-4 px-3

                              md:py-1 py-1"

                              >

                                <div className="flex items-center md:gap-3 gap-1">

                                  <CustomTooltip

                                    label="Access Restricted Contact Admin"

                                    position="bottom"

                                    tooltipBg="bg-black/60 backdrop-blur-md"

                                    tooltipTextColor="text-white py-2 px-4 font-medium"

                                    labelCls="text-[10px] font-medium"

                                    showTooltip={!hasPermission("crm", "edit")}

                                  >

                                    <Button

                                      disabled={!hasPermission("crm", "edit")}

                                    >

                                      <FaEdit

                                        className="text-[#3586FF]  md:text-[20px] text-[12px] cursor-pointer"

                                        onClick={() => handleEdit(leads)}

                                      />

                                    </Button>

                                  </CustomTooltip>

                                  <CustomTooltip

                                    label="Access Restricted Contact Admin"

                                    position="bottom"

                                    tooltipBg="bg-black/60 backdrop-blur-md"

                                    tooltipTextColor="text-white py-2 px-4 font-medium"

                                    labelCls="text-[10px] font-medium"

                                    showTooltip={

                                      !hasPermission("crm", "delete")

                                    }

                                  >

                                    <Button

                                      onClick={() => handleDelete(leads.id)}

                                      disabled={!hasPermission("crm", "delete")}

                                      className="px-3 py-1 text-white rounded"

                                    >

                                      <LuTrash2 className="md:text-[20px] text-[12px] text-red-500" />

                                    </Button>

                                  </CustomTooltip>

                                  <Button

                                    className="md:px-3 px-2 md:py-2 py-1 md:text-[12px] text-[10px] bg-green-500 text-white md:rounded-[8px] rounded-[4px] flex items-center gap-1"

                                    onClick={() =>

                                      handleWhatsappSend(

                                        leads?.Fullname,

                                        leads?.Phonenumber

                                      )

                                    }

                                  >

                                    <BiLogoWhatsapp className="text-white md:text-[20px] text-[12px]" />

                                    Send

                                  </Button>

                                </div>

                              </TableCell>

                            </TableRow>

                          );

                        })}

                      </TableBody>

                    </Table>

                  </TableContainer> */}