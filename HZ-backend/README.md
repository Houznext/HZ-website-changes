TODO list: 

# Fixes
- [ ] User reponse should only have email, id, name, roles, token while login
- [ ] Client side furniture, home decor, electronics get api should not return updated by, product quantity and all the unnecesarry data.
- [ ] All filters for the products should be dynamic
- [ ] Wishlist should also have eletronics

# Refactoring
- [ ] Rather than having furnitures, homedecors, electronics as different entites, Optimise it to one entity and have all specific fields as an productProperties or some relevant name.
- [ ] Add link field to wishlist items (required to navigate from wishlist page to item page)
- [ ] Update the properties get API to fetch the properties based on the following factors, if not provided anything use default values
        limit: number
        sort: a field name, it can be created date, name, udpated date, price etc
        order: asc/desc
        constructionStatus: UnderConstruction/ReadyToMove/NewLaunched
        more can be added later

# Bugs
- [ ] Furniture get api is returning product quantity as string.

# Closed (move the task with the tag like mentioned below after completion)
- [X] Date: Action - task
  ex: 30/1/2025: bug - Furniture get api is returning product quantity as string.